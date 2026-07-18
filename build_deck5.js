const { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG, num } = require("./build_deck4.js");
const path = require("path");

// ============================================================ SLIDE 14 — Simulación: procesamiento
{
  const s = lightSlide("Simulación Práctica — Procesamiento (Grafo Multiagente)", { subtitle: "Sección 5 — Orquestación con LangGraph StateGraph" });
  const steps = [
    ["1", "ConfigMonitorAgent", C.cyan, "Evalúa reglas OWASP/CSA sobre cada evento"],
    ["2", "LogAnalysisAgent", C.amber, "Entrena Random Forest y clasifica anomalías"],
    ["3", "LateralMovementAgent", "7C3AED", "Construye grafo de accesos (NetworkX) y detecta pivoteo"],
    ["4", "ThreatHuntingAgent", "D97706", "Correlaciona alertas → consenso multiagente"],
    ["5", "ResponseAgent", C.green, "Ejecuta o escala respuesta según nivel de consenso"],
  ];
  let x = 0.6;
  const w = 2.28;
  steps.forEach((st, i) => {
    s.addShape("roundRect", { x, y: 2.0, w, h: 2.6, rectRadius: 0.09, fill: { color: "F8FAFC" }, line: { color: st[2], width: 1.2 } });
    iconCircle(s, x + (w / 2 - 0.35), 2.25, 0.7, st[2], st[0]);
    s.addText(st[1], { x: x + 0.08, y: 3.1, w: w - 0.16, h: 0.6, align: "center", fontFace: "Calibri", fontSize: 12, bold: true, color: C.navy2 });
    s.addText(st[3], { x: x + 0.1, y: 3.65, w: w - 0.2, h: 0.9, align: "center", fontFace: "Calibri", fontSize: 9.5, color: C.slate });
    if (i < steps.length - 1) {
      s.addText("→", { x: x + w - 0.05, y: 2.85, w: 0.4, h: 0.5, align: "center", fontFace: "Calibri", fontSize: 22, bold: true, color: C.gray });
    }
    x += w + 0.15;
  });
  s.addShape("roundRect", { x: 0.6, y: 5.0, w: 11.9, h: 1.65, rectRadius: 0.08, fill: { color: "0F172A" } });
  s.addText("Salida de consola (extracto real de la ejecución — mas_simulation.py)", { x: 0.85, y: 5.1, w: 11.4, h: 0.3, fontFace: "Calibri", fontSize: 10.5, bold: true, color: C.cyan2 });
  const consoleLines = [
    "[ConfigMonitorAgent] 805 configuraciones inseguras detectadas.",
    "[LogAnalysisAgent] Modelo entrenado. F1-macro=0.990 | AUC=0.996",
    "[LateralMovementAgent] 25 cuentas con patron de pivoteo anomalo.",
    "[ThreatHuntingAgent] 317 alertas correlacionadas (consenso multiagente).",
    "[ResponseAgent] 317 respuestas generadas (236 autonomas por consenso >=2 agentes).",
  ];
  s.addText(consoleLines.map((l) => ({ text: l, options: { breakLine: true } })), {
    x: 0.85, y: 5.4, w: 11.4, h: 1.2, fontFace: "Courier New", fontSize: 10.5, color: "A7F3D0", lineSpacingMultiple: 1.2,
  });
  footer(s, num());
}

// ============================================================ SLIDE 15 — Resultados: matriz de confusión
{
  const s = lightSlide("Simulación Práctica — Resultados (I)", { subtitle: "Sección 5 — Matriz de confusión del LogAnalysisAgent (n=1,800 eventos de prueba)" });
  s.addImage({ path: path.join(FIG, "confusion_matrix.png"), x: 3.15, y: 1.65, w: 7.0, h: 5.05 * (5/6) });
  footer(s, num());
}

// ============================================================ SLIDE 16 — Resultados: métricas
{
  const s = lightSlide("Simulación Práctica — Resultados (II)", { subtitle: "Sección 5 — Métricas cuantitativas de desempeño" });
  s.addImage({ path: path.join(FIG, "metrics_bar.png"), x: 0.4, y: 1.65, w: 4.55, h: 3.7 });
  s.addImage({ path: path.join(FIG, "metrics_per_class.png"), x: 5.05, y: 1.65, w: 5.6, h: 3.5 });

  const tblRows = [
    [{ text: "Métrica (macro)", options: { bold: true, fill: { color: C.navy2 }, color: C.white, fontSize: 11 } },
     { text: "Valor", options: { bold: true, fill: { color: C.navy2 }, color: C.white, fontSize: 11, align: "center" } }],
    [{ text: "Precisión", options: { fontSize: 11 } }, { text: "0.995", options: { fontSize: 11, align: "center" } }],
    [{ text: "Recall", options: { fontSize: 11 } }, { text: "0.986", options: { fontSize: 11, align: "center" } }],
    [{ text: "F1-score", options: { fontSize: 11 } }, { text: "0.990", options: { fontSize: 11, align: "center" } }],
    [{ text: "AUC-ROC (OvR)", options: { fontSize: 11 } }, { text: "0.996", options: { fontSize: 11, align: "center" } }],
  ];
  s.addText("Tabla resumen", { x: 10.85, y: 1.65, w: 2.1, h: 0.3, fontFace: "Calibri", fontSize: 12, bold: true, color: C.navy2 });
  s.addTable(tblRows, { x: 10.85, y: 2.0, w: 2.1, colW: [1.3, 0.8], border: { type: "solid", color: "E2E8F0", pt: 0.75 }, fontFace: "Calibri", autoPage: false, rowH: 0.42 });
  s.addText("Set de prueba: n=1,800 (30% hold-out estratificado)", { x: 0.4, y: 5.55, w: 12.4, h: 0.3, fontFace: "Calibri", fontSize: 10, italic: true, color: C.gray });
  footer(s, num());
}

// ============================================================ SLIDE 17 — Respuesta autónoma / consenso
{
  const s = lightSlide("Simulación Práctica — Coordinación y Respuesta Autónoma", { subtitle: "Sección 5 — Consenso multiagente (ThreatHuntingAgent + ResponseAgent)" });
  s.addImage({ path: path.join(FIG, "response_consensus.png"), x: 0.6, y: 1.75, w: 5.9, h: 4.4 });
  s.addImage({ path: path.join(FIG, "feature_importance.png"), x: 6.75, y: 1.75, w: 5.9, h: 4.4 });
  s.addText("Regla de coordinación: una acción de contención (revocar credenciales, aislar instancia, snapshot forense) se ejecuta de forma autónoma solo cuando ≥2 agentes corroboran la alerta (voto ThreatHunting + ConfigMonitor); en caso contrario se escala a revisión humana.", {
    x: 0.6, y: 6.3, w: 12, h: 0.7, fontFace: "Calibri", fontSize: 10.5, italic: true, color: C.slate,
  });
  footer(s, num());
}

// ============================================================ SLIDE 18 — Reproducibilidad / código
{
  const s = lightSlide("Código Fuente y Reproducibilidad", { subtitle: "Sección 5 — Disponibilidad del código y ejecución" });
  s.addShape("roundRect", { x: 0.6, y: 1.8, w: 11.9, h: 2.0, rectRadius: 0.1, fill: { color: C.navy2 } });
  s.addText("Repositorio (GitHub / Colab): [enlace del equipo — completar antes de la sustentación]", {
    x: 0.9, y: 2.0, w: 11.3, h: 0.5, fontFace: "Calibri", fontSize: 14, bold: true, color: C.cyan2 });
  s.addText("Incluye: generate_data.py · mas_simulation.py (grafo LangGraph) · make_figures.py · README.md con instrucciones · notebook con salidas de ejecución visibles.", {
    x: 0.9, y: 2.5, w: 11.3, h: 1.1, fontFace: "Calibri", fontSize: 12, color: C.ice });
  s.addShape("roundRect", { x: 0.6, y: 4.05, w: 11.9, h: 2.5, rectRadius: 0.1, fill: { color: "0F172A" } });
  s.addText("Instrucciones de ejecución (README.md)", { x: 0.9, y: 4.2, w: 11, h: 0.35, fontFace: "Calibri", fontSize: 12.5, bold: true, color: C.cyan2 });
  const cmds = [
    "pip install langgraph langchain-core scikit-learn pandas matplotlib networkx",
    "python3 generate_data.py     # genera dataset sintetico reproducible (seed=42)",
    "python3 mas_simulation.py    # ejecuta el grafo multiagente end-to-end",
    "python3 make_figures.py      # genera graficas de metricas",
  ];
  s.addText(cmds.map((l) => ({ text: "$ " + l, options: { breakLine: true } })), {
    x: 0.9, y: 4.65, w: 11.3, h: 1.8, fontFace: "Courier New", fontSize: 11.5, color: "A7F3D0", lineSpacingMultiple: 1.35,
  });
  footer(s, num());
}

module.exports = { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG, num };
