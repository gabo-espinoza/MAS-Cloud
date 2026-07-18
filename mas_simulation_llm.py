"""
mas_simulation_llm.py
-----------------------
Version hibrida del sistema multiagente: reutiliza ConfigMonitorAgent,
LogAnalysisAgent y LateralMovementAgent de mas_simulation.py (deterministas,
para conservar las metricas reproducibles) y reemplaza ThreatHuntingAgent y
ResponseAgent por versiones que razonan con DeepSeek (llm_agents.py).

USO:
    export DEEPSEEK_API_KEY="tu_api_key"
    python3 mas_simulation_llm.py

Requiere internet saliente hacia api.deepseek.com (no funciona dentro de
sandboxes con egress restringido -- probado y documentado en el desarrollo
de este proyecto).
"""
from __future__ import annotations
import json
import os
import time

import pandas as pd
from langgraph.graph import StateGraph, END

from mas_simulation import (
    MASState, config_monitor_agent, log_analysis_agent, lateral_movement_agent,
)
from llm_agents import threat_hunting_agent_llm, response_agent_llm


def build_hybrid_graph():
    graph = StateGraph(MASState)
    graph.add_node("ConfigMonitorAgent", config_monitor_agent)
    graph.add_node("LogAnalysisAgent", log_analysis_agent)
    graph.add_node("LateralMovementAgent", lateral_movement_agent)
    graph.add_node("ThreatHuntingAgent_LLM", threat_hunting_agent_llm)
    graph.add_node("ResponseAgent_LLM", response_agent_llm)

    graph.set_entry_point("ConfigMonitorAgent")
    graph.add_edge("ConfigMonitorAgent", "LogAnalysisAgent")
    graph.add_edge("LogAnalysisAgent", "LateralMovementAgent")
    graph.add_edge("LateralMovementAgent", "ThreatHuntingAgent_LLM")
    graph.add_edge("ThreatHuntingAgent_LLM", "ResponseAgent_LLM")
    graph.add_edge("ResponseAgent_LLM", END)
    return graph.compile()


if __name__ == "__main__":
    from generate_data import generate_dataset

    if not os.environ.get("DEEPSEEK_API_KEY"):
        raise SystemExit(
            "Falta DEEPSEEK_API_KEY. Ejecuta:\n"
            "  export DEEPSEEK_API_KEY='tu_api_key'\n"
            "antes de correr este script."
        )

    # limpiar transcript anterior para esta corrida
    os.makedirs("data", exist_ok=True)
    open("data/llm_transcript.jsonl", "w").close()

    t0 = time.time()
    print("=" * 70)
    print("SIMULACION MAS HIBRIDA (deterministica + DeepSeek LLM)")
    print("=" * 70)

    events = generate_dataset()
    app = build_hybrid_graph()

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
    m = final_state["metrics"]
    print(f"LogAnalysisAgent (determinista) -> F1-macro={m['f1_macro']:.3f} | AUC={m['auc_macro_ovr']:.3f}")
    print(f"Tiempo total: {time.time() - t0:.2f}s")

    with open("data/response_log_llm.json", "w") as f:
        json.dump(final_state["response_log"], f, indent=2, ensure_ascii=False)
    with open("data/fused_alerts_llm.json", "w") as f:
        json.dump(final_state["fused_alerts"], f, indent=2, ensure_ascii=False)

    print("Resultados guardados en ./data/ (response_log_llm.json, fused_alerts_llm.json, llm_transcript.jsonl)")
