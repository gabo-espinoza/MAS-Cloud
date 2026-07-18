"""
mas_simulation.py
------------------
Sistema Multiagente (MAS) para detección y respuesta coordinada en un
entorno de computación en la nube simulado, orquestado con LangGraph.

Agentes especializados (cada uno = nodo del grafo, con las propiedades
clásicas de MAS: autonomía, reactividad, proactividad y sociabilidad):

  1. ConfigMonitorAgent   -> detecta misconfigurations (reglas basadas en
                              OWASP Cloud-Native Top 10 / CSA CCM: ACL
                              pública, políticas IAM con wildcard, etc.)
  2. LogAnalysisAgent     -> modelo de Machine Learning (Random Forest)
                              entrenado sobre eventos estilo CloudTrail
                              para clasificar anomalías (proxy de
                              MITRE ATT&CK for Cloud: TA0004, TA0008, TA0010)
  3. LateralMovementAgent -> análisis basado en grafos de acceso
                              entre cuentas/recursos para detectar
                              pivoteo anómalo
  4. ThreatHuntingAgent   -> correlaciona alertas de los agentes
                              anteriores de forma proactiva (hunting)
                              y calcula un score de amenaza compuesto
  5. ResponseAgent        -> ejecuta -de forma autónoma y coordinada-
                              acciones de contención (revocar
                              credenciales, aislar instancia, snapshot)
                              cuando el score supera un umbral de
                              consenso entre agentes (sociabilidad/
                              coordinación multiagente)

El flujo se modela como un grafo de estados con LangGraph (StateGraph),
sin requerir llamadas a un LLM externo para garantizar reproducibilidad
100% offline; el diseño es directamente extensible a nodos con
razonamiento LLM (p. ej. reemplazando ThreatHuntingAgent por un agente
LLM que redacte el veredicto en lenguaje natural).
"""
from __future__ import annotations
import json
import time
from typing import TypedDict, List, Dict, Any

import numpy as np
import pandas as pd
import networkx as nx
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    confusion_matrix, classification_report
)
from sklearn.preprocessing import LabelEncoder

from langgraph.graph import StateGraph, END

# ----------------------------------------------------------------------
# 1. ESTADO COMPARTIDO DEL SISTEMA MULTIAGENTE
# ----------------------------------------------------------------------
class MASState(TypedDict):
    events: pd.DataFrame
    config_alerts: List[Dict[str, Any]]
    ml_predictions: pd.DataFrame
    lateral_alerts: List[Dict[str, Any]]
    fused_alerts: List[Dict[str, Any]]
    response_log: List[Dict[str, Any]]
    metrics: Dict[str, Any]


# ----------------------------------------------------------------------
# 2. AGENTE 1 — ConfigMonitorAgent (reactivo)
#    Simula agentes tipo "AWS Config / Azure Policy" evaluando reglas
# ----------------------------------------------------------------------
def config_monitor_agent(state: MASState) -> MASState:
    df = state["events"]
    alerts = []
    risky = df[(df["is_public_acl"] == 1) | (df["iam_wildcard_permissions"] == 1)]
    for _, row in risky.iterrows():
        severity = "ALTA" if (row["is_public_acl"] == 1 and row["iam_wildcard_permissions"] == 1) else "MEDIA"
        alerts.append({
            "event_id": row["event_id"],
            "agent": "ConfigMonitorAgent",
            "rule": "public_acl_or_iam_wildcard",
            "severity": severity,
        })
    state["config_alerts"] = alerts
    print(f"[ConfigMonitorAgent] {len(alerts)} configuraciones inseguras detectadas.")
    return state


# ----------------------------------------------------------------------
# 3. AGENTE 2 — LogAnalysisAgent (aprendizaje supervisado / proactivo)
# ----------------------------------------------------------------------
FEATURES = [
    "source_ip_entropy", "requests_per_min", "distinct_resources_touched",
    "is_public_acl", "iam_wildcard_permissions", "data_transfer_mb",
    "new_role_assumed", "off_hours", "mfa_present",
]

def log_analysis_agent(state: MASState) -> MASState:
    df = state["events"].copy()
    X = df[FEATURES]
    y = df["label"]

    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, df.index, test_size=0.30, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=300, max_depth=12, class_weight="balanced", random_state=42
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)

    precision = precision_score(y_test, y_pred, average="macro")
    recall = recall_score(y_test, y_pred, average="macro")
    f1 = f1_score(y_test, y_pred, average="macro")
    try:
        auc = roc_auc_score(y_test, y_proba, multi_class="ovr", average="macro")
    except ValueError:
        auc = float("nan")

    cm = confusion_matrix(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=["benigno", "misconfig", "lateral", "exfiltracion"], output_dict=True)

    results = df.loc[idx_test].copy()
    results["y_true"] = y_test.values
    results["y_pred"] = y_pred
    results["confidence"] = y_proba.max(axis=1)

    state["ml_predictions"] = results
    state["metrics"] = {
        "precision_macro": precision,
        "recall_macro": recall,
        "f1_macro": f1,
        "auc_macro_ovr": auc,
        "confusion_matrix": cm.tolist(),
        "classification_report": report,
        "feature_importances": dict(zip(FEATURES, clf.feature_importances_.tolist())),
    }
    print(f"[LogAnalysisAgent] Modelo entrenado. F1-macro={f1:.3f} | AUC={auc:.3f}")
    return state


# ----------------------------------------------------------------------
# 4. AGENTE 3 — LateralMovementAgent (basado en grafos)
# ----------------------------------------------------------------------
def lateral_movement_agent(state: MASState) -> MASState:
    df = state["events"]
    G = nx.DiGraph()
    alerts = []

    suspicious = df[(df["distinct_resources_touched"] >= 5) & (df["requests_per_min"] >= 10)]
    for _, row in suspicious.iterrows():
        src = f"acct-{row['account_id']}"
        dst = f"{row['resource_type']}-{row['event_id'][-3:]}"
        G.add_edge(src, dst, weight=row["requests_per_min"])

    # Cuentas con alto "out-degree" en poco tiempo = pivoteo anómalo
    for node in G.nodes():
        out_deg = G.out_degree(node)
        if node.startswith("acct-") and out_deg >= 3:
            alerts.append({
                "account": node,
                "agent": "LateralMovementAgent",
                "out_degree": out_deg,
                "severity": "ALTA" if out_deg >= 6 else "MEDIA",
            })

    state["lateral_alerts"] = alerts
    print(f"[LateralMovementAgent] {len(alerts)} cuentas con patrón de pivoteo anómalo.")
    return state


# ----------------------------------------------------------------------
# 5. AGENTE 4 — ThreatHuntingAgent (fusión / correlación proactiva)
# ----------------------------------------------------------------------
def threat_hunting_agent(state: MASState) -> MASState:
    ml = state["ml_predictions"]
    config_alert_ids = {a["event_id"] for a in state["config_alerts"]}

    fused = []
    high_conf = ml[(ml["y_pred"] != 0) & (ml["confidence"] >= 0.6)]
    for _, row in high_conf.iterrows():
        corroborated_by_config = row["event_id"] in config_alert_ids
        votes = 1 + int(corroborated_by_config)
        fused.append({
            "event_id": row["event_id"],
            "predicted_class": int(row["y_pred"]),
            "confidence": float(row["confidence"]),
            "corroborated_by_config_agent": corroborated_by_config,
            "consensus_votes": votes,
        })

    state["fused_alerts"] = fused
    print(f"[ThreatHuntingAgent] {len(fused)} alertas correlacionadas (consenso multiagente).")
    return state


# ----------------------------------------------------------------------
# 6. AGENTE 5 — ResponseAgent (respuesta autónoma coordinada)
# ----------------------------------------------------------------------
CLASS_ACTIONS = {
    1: "Revertir configuración pública / aplicar política de mínimo privilegio",
    2: "Revocar credenciales temporales y forzar reautenticación (MFA)",
    3: "Aislar instancia/función y activar snapshot forense",
}

def response_agent(state: MASState) -> MASState:
    log = []
    for alert in state["fused_alerts"]:
        votes = alert["consensus_votes"]
        cls = alert["predicted_class"]
        if votes >= 2:
            action = CLASS_ACTIONS.get(cls, "Escalar a analista humano")
            status = "EJECUTADA_AUTOMATICAMENTE"
        else:
            action = "Marcar para revisión (confianza insuficiente para autonomía total)"
            status = "PENDIENTE_REVISION_HUMANA"
        log.append({
            "event_id": alert["event_id"],
            "agent": "ResponseAgent",
            "action": action,
            "status": status,
            "consensus_votes": votes,
        })
    state["response_log"] = log
    auto = sum(1 for r in log if r["status"] == "EJECUTADA_AUTOMATICAMENTE")
    print(f"[ResponseAgent] {len(log)} respuestas generadas ({auto} autónomas por consenso >=2 agentes).")
    return state


# ----------------------------------------------------------------------
# 7. CONSTRUCCIÓN DEL GRAFO MULTIAGENTE (LangGraph)
# ----------------------------------------------------------------------
def build_graph():
    graph = StateGraph(MASState)
    graph.add_node("ConfigMonitorAgent", config_monitor_agent)
    graph.add_node("LogAnalysisAgent", log_analysis_agent)
    graph.add_node("LateralMovementAgent", lateral_movement_agent)
    graph.add_node("ThreatHuntingAgent", threat_hunting_agent)
    graph.add_node("ResponseAgent", response_agent)

    graph.set_entry_point("ConfigMonitorAgent")
    graph.add_edge("ConfigMonitorAgent", "LogAnalysisAgent")
    graph.add_edge("LogAnalysisAgent", "LateralMovementAgent")
    graph.add_edge("LateralMovementAgent", "ThreatHuntingAgent")
    graph.add_edge("ThreatHuntingAgent", "ResponseAgent")
    graph.add_edge("ResponseAgent", END)
    return graph.compile()


if __name__ == "__main__":
    from generate_data import generate_dataset

    t0 = time.time()
    print("=" * 70)
    print("SIMULACIÓN MAS — DETECCIÓN Y RESPUESTA EN ENTORNO CLOUD")
    print("=" * 70)

    events = generate_dataset()
    app = build_graph()

    initial_state: MASState = {
        "events": events,
        "config_alerts": [],
        "ml_predictions": pd.DataFrame(),
        "lateral_alerts": [],
        "fused_alerts": [],
        "response_log": [],
        "metrics": {},
    }

    final_state = app.invoke(initial_state)

    print("-" * 70)
    print("MÉTRICAS DEL MODELO (LogAnalysisAgent):")
    m = final_state["metrics"]
    print(f"  Precision (macro): {m['precision_macro']:.4f}")
    print(f"  Recall    (macro): {m['recall_macro']:.4f}")
    print(f"  F1-score  (macro): {m['f1_macro']:.4f}")
    print(f"  AUC-ROC   (macro, OvR): {m['auc_macro_ovr']:.4f}")
    print("-" * 70)
    print(f"Tiempo total de simulación: {time.time()-t0:.2f}s")

    # Persistir resultados para figuras y reporte
    final_state["ml_predictions"].to_csv("data/ml_predictions.csv", index=False)
    with open("data/metrics.json", "w") as f:
        json.dump(m, f, indent=2)
    with open("data/response_log.json", "w") as f:
        json.dump(final_state["response_log"], f, indent=2)
    with open("data/fused_alerts.json", "w") as f:
        json.dump(final_state["fused_alerts"], f, indent=2)
    with open("data/config_alerts.json", "w") as f:
        json.dump(final_state["config_alerts"], f, indent=2)
    with open("data/lateral_alerts.json", "w") as f:
        json.dump(final_state["lateral_alerts"], f, indent=2)
    with open("data/pipeline_summary.json", "w") as f:
        json.dump({
            "total_eventos": int(len(events)),
            "config_alerts": len(final_state["config_alerts"]),
            "lateral_alerts": len(final_state["lateral_alerts"]),
            "fused_alerts": len(final_state["fused_alerts"]),
            "respuestas_autonomas": sum(1 for r in final_state["response_log"] if r["status"] == "EJECUTADA_AUTOMATICAMENTE"),
            "respuestas_revision_humana": sum(1 for r in final_state["response_log"] if r["status"] == "PENDIENTE_REVISION_HUMANA"),
        }, f, indent=2)

    print("Resultados guardados en ./data/ (incluye config_alerts.json, lateral_alerts.json y pipeline_summary.json)")
