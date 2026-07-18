"""
llm_agents.py
--------------
Version "hibrida" de los agentes ThreatHuntingAgent y ResponseAgent que
reemplaza la logica puramente determinista (conteo de votos / if-else) por
razonamiento real de un LLM (DeepSeek, API compatible con OpenAI) orquestado
como nodos de LangGraph.

DISENO:
  - ConfigMonitorAgent, LogAnalysisAgent y LateralMovementAgent (mas_simulation.py)
    NO se tocan: siguen siendo deterministas porque son los que producen las
    metricas cuantitativas reproducibles (precision, recall, F1, AUC) que
    exige la rubrica. Un LLM con temperature>0 podria variar entre corridas
    y romper la reproducibilidad de esas cifras.
  - ThreatHuntingAgent_LLM: recibe SOLO las alertas ya filtradas por los
    agentes deterministas (no los 6000 eventos crudos, para ahorrar tokens)
    y le pide al modelo que correlacione, razone en lenguaje natural y
    devuelva un veredicto estructurado (JSON) por alerta.
  - ResponseAgent_LLM: usa "function calling" real de DeepSeek. Se le dan
    4 herramientas (revocar credenciales, aislar instancia, activar snapshot,
    escalar a humano) y el modelo decide cual invocar segun el veredicto del
    ThreatHuntingAgent_LLM. El gate de autonomia (consenso >= 2 agentes)
    se mantiene FUERA del LLM, como una validacion previa obligatoria -- el
    LLM razona DENTRO de esa barrera, no la reemplaza. Esto conserva el
    argumento de "autonomia con control" para el analisis critico/etico.
  - Reproducibilidad: temperature=0 y se guarda un transcript completo
    (prompt + respuesta cruda) en data/llm_transcript.jsonl para poder
    mostrarlo en la sustentacion aunque no haya internet en el momento.

Requiere: pip install openai
Variable de entorno: DEEPSEEK_API_KEY (nunca hardcodear la key en el codigo)
"""
from __future__ import annotations
import os
import json
import time
from typing import TypedDict, List, Dict, Any

from openai import OpenAI

DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
DEEPSEEK_MODEL = "deepseek-chat"   # usar "deepseek-reasoner" para razonamiento paso a paso (mas lento/caro)
TRANSCRIPT_PATH = "data/llm_transcript.jsonl"

FEATURES = [
    "source_ip_entropy", "requests_per_min", "distinct_resources_touched",
    "is_public_acl", "iam_wildcard_permissions", "data_transfer_mb",
    "new_role_assumed", "off_hours", "mfa_present",
]

CLASS_NAMES = {0: "benigno", 1: "misconfiguration", 2: "movimiento_lateral", 3: "exfiltracion"}

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "revocar_credenciales",
            "description": "Revoca las credenciales temporales / access keys asociadas al evento y fuerza reautenticacion con MFA.",
            "parameters": {
                "type": "object",
                "properties": {
                    "event_id": {"type": "string"},
                    "justificacion": {"type": "string", "description": "Explicacion breve de por que se justifica esta accion"},
                },
                "required": ["event_id", "justificacion"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "aislar_instancia",
            "description": "Aisla la instancia/funcion serverless de la red y activa un snapshot forense antes de terminarla.",
            "parameters": {
                "type": "object",
                "properties": {
                    "event_id": {"type": "string"},
                    "justificacion": {"type": "string"},
                },
                "required": ["event_id", "justificacion"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "revertir_configuracion",
            "description": "Revierte una configuracion insegura (ACL publica, politica IAM con wildcard) a su estado seguro por defecto.",
            "parameters": {
                "type": "object",
                "properties": {
                    "event_id": {"type": "string"},
                    "justificacion": {"type": "string"},
                },
                "required": ["event_id", "justificacion"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "escalar_a_humano",
            "description": "Marca la alerta para revision manual de un analista, sin ejecutar ninguna accion de contencion automatica.",
            "parameters": {
                "type": "object",
                "properties": {
                    "event_id": {"type": "string"},
                    "justificacion": {"type": "string"},
                },
                "required": ["event_id", "justificacion"],
            },
        },
    },
]


def _client() -> OpenAI:
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        raise RuntimeError(
            "Falta la variable de entorno DEEPSEEK_API_KEY. "
            "Ejecuta: export DEEPSEEK_API_KEY='tu_api_key' antes de correr este script."
        )
    return OpenAI(api_key=api_key, base_url=DEEPSEEK_BASE_URL)


def _log_transcript(record: Dict[str, Any]) -> None:
    os.makedirs("data", exist_ok=True)
    with open(TRANSCRIPT_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def threat_hunting_agent_llm(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sustituye al ThreatHuntingAgent determinista. Recibe las predicciones
    del LogAnalysisAgent (ML) y las alertas del ConfigMonitorAgent, y le
    pide al LLM que correlacione y redacte un veredicto por evento.
    """
    client = _client()
    ml = state["ml_predictions"]
    config_alert_ids = {a["event_id"] for a in state["config_alerts"]}

    candidates = ml[(ml["y_pred"] != 0) & (ml["confidence"] >= 0.6)]
    fused = []

    # Se procesan en lotes para minimizar el numero de llamadas (costo/latencia)
    BATCH_SIZE = 10
    rows = candidates.to_dict("records")
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        payload = [
            {
                "event_id": r["event_id"],
                "clase_predicha_ml": CLASS_NAMES[int(r["y_pred"])],
                "confianza_ml": round(float(r["confidence"]), 3),
                "corroborado_por_config_agent": r["event_id"] in config_alert_ids,
                "features": {k: (float(r[k]) if isinstance(r[k], (int, float)) else r[k]) for k in FEATURES},
            }
            for r in batch
        ]
        system_prompt = (
            "Eres el ThreatHuntingAgent de un sistema multiagente de ciberseguridad cloud. "
            "Recibes alertas ya generadas por un modelo de Machine Learning (Random Forest) y por un "
            "agente de reglas de configuracion (OWASP/CSA CCM). Tu trabajo es correlacionar ambas señales "
            "y decidir, para cada evento, un nivel de consenso (1 o 2) y una justificacion breve en español. "
            "Usa consenso=2 solo si encuentras evidencia consistente en las features del evento ademas de la "
            "señal del ML. Responde EXCLUSIVAMENTE con un JSON de la forma "
            '{"veredictos": [{"event_id": str, "consenso": 1|2, "severidad": "BAJA|MEDIA|ALTA", "razon": str}]}'
        )
        user_prompt = json.dumps(payload, ensure_ascii=False)

        resp = client.chat.completions.create(
            model=DEEPSEEK_MODEL,
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        raw = resp.choices[0].message.content
        _log_transcript({"agent": "ThreatHuntingAgent_LLM", "batch": i // BATCH_SIZE,
                          "prompt": user_prompt, "response": raw})

        try:
            parsed = json.loads(raw)
            veredictos = {v["event_id"]: v for v in parsed.get("veredictos", [])}
        except (json.JSONDecodeError, KeyError):
            veredictos = {}

        for r in batch:
            eid = r["event_id"]
            v = veredictos.get(eid, {})
            fused.append({
                "event_id": eid,
                "predicted_class": int(r["y_pred"]),
                "confidence": float(r["confidence"]),
                "corroborated_by_config_agent": eid in config_alert_ids,
                "consensus_votes": v.get("consenso", 1 + int(eid in config_alert_ids)),
                "severity_llm": v.get("severidad", "MEDIA"),
                "reasoning_llm": v.get("razon", "(sin respuesta valida del LLM, se aplico fallback determinista)"),
            })

    state["fused_alerts"] = fused
    print(f"[ThreatHuntingAgent_LLM] {len(fused)} alertas correlacionadas por DeepSeek "
          f"en {(len(rows) + BATCH_SIZE - 1) // BATCH_SIZE} llamadas.")
    return state


def response_agent_llm(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sustituye al ResponseAgent determinista. El gate de autonomia
    (consenso >= 2) se evalua ANTES de invocar al LLM -- el LLM solo decide
    QUE accion tomar dentro de los casos ya habilitados para autonomia,
    usando tool calling real. Los casos de bajo consenso se escalan sin
    consultar al LLM (ahorra tokens y preserva la barrera de seguridad).
    """
    client = _client()
    log = []

    autonomous_cases = [a for a in state["fused_alerts"] if a["consensus_votes"] >= 2]
    low_consensus_cases = [a for a in state["fused_alerts"] if a["consensus_votes"] < 2]

    for alert in low_consensus_cases:
        log.append({
            "event_id": alert["event_id"], "agent": "ResponseAgent_LLM",
            "action": "Marcar para revision (confianza insuficiente para autonomia total)",
            "status": "PENDIENTE_REVISION_HUMANA", "consensus_votes": alert["consensus_votes"],
            "reasoning_llm": None,
        })

    system_prompt = (
        "Eres el ResponseAgent de un sistema multiagente de ciberseguridad cloud. Para cada alerta que "
        "recibes, YA se determino que hay consenso suficiente (>=2 agentes) para actuar de forma autonoma. "
        "Tu trabajo es elegir, mediante tool calling, la accion de contencion mas adecuada segun la clase "
        "de amenaza y el razonamiento del ThreatHuntingAgent, y justificar brevemente en español por que "
        "la elegiste. Debes invocar exactamente una herramienta por alerta."
    )

    for alert in autonomous_cases:
        user_prompt = json.dumps({
            "event_id": alert["event_id"],
            "clase_predicha": CLASS_NAMES[alert["predicted_class"]],
            "severidad": alert.get("severity_llm", "MEDIA"),
            "razon_threat_hunting": alert.get("reasoning_llm", ""),
            "consenso": alert["consensus_votes"],
        }, ensure_ascii=False)

        resp = client.chat.completions.create(
            model=DEEPSEEK_MODEL,
            temperature=0,
            tools=TOOLS,
            tool_choice="required",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        msg = resp.choices[0].message
        _log_transcript({"agent": "ResponseAgent_LLM", "event_id": alert["event_id"],
                          "prompt": user_prompt,
                          "response": msg.model_dump() if hasattr(msg, "model_dump") else str(msg)})

        if msg.tool_calls:
            call = msg.tool_calls[0]
            try:
                args = json.loads(call.function.arguments)
            except json.JSONDecodeError:
                args = {}
            log.append({
                "event_id": alert["event_id"], "agent": "ResponseAgent_LLM",
                "action": call.function.name, "status": "EJECUTADA_AUTOMATICAMENTE_LLM",
                "consensus_votes": alert["consensus_votes"],
                "reasoning_llm": args.get("justificacion", ""),
            })
        else:
            log.append({
                "event_id": alert["event_id"], "agent": "ResponseAgent_LLM",
                "action": "escalar_a_humano (sin tool_call valido)", "status": "PENDIENTE_REVISION_HUMANA",
                "consensus_votes": alert["consensus_votes"], "reasoning_llm": None,
            })

    state["response_log"] = log
    auto = sum(1 for r in log if r["status"] == "EJECUTADA_AUTOMATICAMENTE_LLM")
    print(f"[ResponseAgent_LLM] {len(log)} respuestas generadas ({auto} autonomas via DeepSeek tool calling).")
    return state
