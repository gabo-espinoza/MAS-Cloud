# MAS para Ciberseguridad en Entornos de Computacion en la Nube

Simulacion de un Sistema Multiagente (MAS) orquestado con **LangGraph** para
deteccion y respuesta coordinada ante configuraciones inseguras, movimiento
lateral y exfiltracion de datos en un entorno cloud simulado.

## Autores
Gabriel Espinoza, Victor Martinez

## Arquitectura (ver `figures/architecture_diagram` en la presentacion)
5 agentes orquestados como grafo de estados (StateGraph):

1. **ConfigMonitorAgent** - reglas tipo AWS Config/Azure Policy (OWASP Cloud-Native Top 10, CSA CCM)
2. **LogAnalysisAgent** - Random Forest sobre eventos sinteticos tipo CloudTrail (proxy MITRE ATT&CK for Cloud)
3. **LateralMovementAgent** - deteccion basada en grafos (NetworkX) de pivoteo entre cuentas/recursos
4. **ThreatHuntingAgent** - correlacion/fusion de alertas (consenso multiagente)
5. **ResponseAgent** - respuesta autonoma coordinada (revocar credenciales, aislar instancia, snapshot) cuando hay consenso >= 2 agentes

## Requisitos
```
pip install langgraph langchain-core scikit-learn pandas matplotlib networkx
```

## Ejecucion
```bash
python3 generate_data.py     # genera dataset sintetico (data/cloudtrail_synthetic.csv)
python3 mas_simulation.py    # corre el grafo multiagente end-to-end
python3 make_figures.py      # genera graficas de metricas (figures/)
```

## Salidas
- `data/cloudtrail_synthetic.csv` - 6000 eventos sinteticos etiquetados (4 clases)
- `data/metrics.json` - precision, recall, F1, AUC-ROC (macro), matriz de confusion, importancia de variables
- `data/fused_alerts.json`, `data/response_log.json` - trazas de coordinacion y respuesta
- `figures/*.png` - matriz de confusion, metricas globales y por clase, importancia de variables, consenso de respuesta

## Resultados obtenidos (semilla fija = 42, reproducible)
| Metrica (macro, n=1800 test) | Valor |
|---|---|
| Precision | 0.995 |
| Recall | 0.986 |
| F1-score | 0.990 |
| AUC-ROC (OvR) | 0.996 |

## Justificacion de datos sinteticos
No se usan logs reales de produccion por razones de confidencialidad y etica.
El generador estocastico (semilla fija) reproduce distribuciones inspiradas en
MITRE ATT&CK for Cloud (TA0004, TA0008, TA0010) y en el caso Capital One (2019).

## Nota de diseno
Los agentes se implementan como nodos deterministas (reglas + ML clasico) para
garantizar 100% de reproducibilidad offline. El grafo de LangGraph es
directamente extensible: cualquier nodo (p. ej. ThreatHuntingAgent) puede
reemplazarse por un agente basado en LLM que razone y redacte el veredicto en
lenguaje natural, sin cambiar la topologia de coordinacion multiagente.

## Extension: agentes LLM reales con DeepSeek (opcional)

Ademas de la version 100% determinista (`mas_simulation.py`), el proyecto incluye
una version hibrida en `mas_simulation_llm.py` + `llm_agents.py` donde el
ThreatHuntingAgent y el ResponseAgent razonan con un LLM real (DeepSeek, API
compatible con OpenAI) en lugar de logica if/else. ConfigMonitorAgent,
LogAnalysisAgent y LateralMovementAgent se mantienen deterministas para
preservar las metricas reproducibles (precision/recall/F1/AUC).

Diseno clave: el gate de autonomia (consenso >= 2 agentes) se evalua ANTES de
invocar al LLM -- el modelo razona dentro de esa barrera de seguridad
(decide QUE accion tomar via tool calling), no la reemplaza.

### Ejecucion
```bash
pip install openai
export DEEPSEEK_API_KEY="tu_api_key"     # nunca hardcodear la key en el codigo
python3 mas_simulation_llm.py
```

Genera `data/response_log_llm.json`, `data/fused_alerts_llm.json` y
`data/llm_transcript.jsonl` (prompt + respuesta cruda de cada llamada, util
para mostrar evidencia de las decisiones del LLM en la sustentacion aunque
no haya internet disponible en el momento de presentar).

Nota: requiere salida de red hacia `api.deepseek.com`; no funciona en
entornos con egress restringido a una lista blanca de dominios.
