const { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG, num } = require("./build_deck.js");

// ============================================================ SLIDE 5 — Fundamentos IA
{
  const s = lightSlide("Fundamentos de IA Relevantes", { subtitle: "Sección 3 — Bases técnicas y conceptuales" });
  const cols = [
    [C.cyan, "Aprendizaje supervisado", "Random Forest entrenado sobre eventos etiquetados (benigno / misconfig / lateral / exfiltración) para el LogAnalysisAgent. Permite obtener precision, recall, F1 y AUC medibles."],
    [C.amber, "Detección basada en reglas + grafos", "El ConfigMonitorAgent aplica reglas deterministas (OWASP/CSA); el LateralMovementAgent construye un grafo de accesos (NetworkX) para detectar pivoteo — análogo a métodos no supervisados de análisis estructural."],
    [C.green, "Agentes basados en LLM (extensión)", "La arquitectura es compatible con razonamiento generativo: un agente LLM (vía LangGraph) puede reemplazar al ThreatHuntingAgent para redactar veredictos explicables en lenguaje natural."],
  ];
  cols.forEach((c, i) => {
    const bx = 0.6 + i * 4.05;
    s.addShape("roundRect", { x: bx, y: 1.75, w: 3.85, h: 4.9, rectRadius: 0.1, fill: { color: "FFFFFF" }, line: { color: "E2E8F0", width: 1 },
      shadow: { type: "outer", color: "94A3B8", opacity: 0.25, blur: 6, offset: 2, angle: 90 } });
    iconCircle(s, bx + 0.3, by(2.0), 0.6, c[0], String(i + 1));
    s.addText(c[1], { x: bx + 0.25, y: 2.75, w: 3.35, h: 0.7, fontFace: "Calibri", fontSize: 14.5, bold: true, color: C.navy2 });
    s.addText(c[2], { x: bx + 0.25, y: 3.5, w: 3.35, h: 2.9, fontFace: "Calibri", fontSize: 11.5, color: C.slate, lineSpacingMultiple: 1.2 });
  });
  function by(v) { return v; }
  footer(s, num());
}

// ============================================================ SLIDE 6 — Principios MAS
{
  const s = lightSlide("Principios de los Sistemas Multiagente (MAS)", { subtitle: "Sección 3 — Bases técnicas y conceptuales" });
  const props = [
    [C.cyan, "Autonomía", "Cada agente opera sin intervención humana centralizada: decide cuándo evaluar una regla, reentrenar o disparar una respuesta."],
    [C.amber, "Reactividad", "Los agentes responden en tiempo real a eventos del entorno cloud (nuevo log, cambio de configuración, tráfico anómalo)."],
    [C.green, "Proactividad", "El ThreatHuntingAgent correlaciona señales de forma anticipada (threat hunting), no solo reacciona a alertas puntuales."],
    ["7C3AED", "Sociabilidad", "Los agentes se coordinan mediante mensajería estructurada (inspirada en FIPA-ACL) orquestada como grafo de estados en LangGraph."],
  ];
  props.forEach((p, i) => {
    const bx = 0.6 + i * 3.08;
    s.addShape("roundRect", { x: bx, y: 1.85, w: 2.85, h: 4.6, rectRadius: 0.1, fill: { color: "F8FAFC" }, line: { color: p[0], width: 1.3 } });
    iconCircle(s, bx + 0.95, 2.15, 0.95, p[0], "");
    s.addText(p[1], { x: bx + 0.15, y: 3.3, w: 2.55, h: 0.5, align: "center", fontFace: "Calibri", fontSize: 15, bold: true, color: C.navy2 });
    s.addText(p[2], { x: bx + 0.2, y: 3.85, w: 2.45, h: 2.5, align: "center", fontFace: "Calibri", fontSize: 11, color: C.slate, lineSpacingMultiple: 1.15 });
  });
  footer(s, num());
}

// ============================================================ SLIDE 7 — FIPA + Responsabilidad compartida
{
  const s = lightSlide("Interoperabilidad (FIPA) y Responsabilidad Compartida", { subtitle: "Sección 3 — Bases técnicas y conceptuales" });
  s.addShape("roundRect", { x: 0.6, y: 1.75, w: 5.9, h: 4.9, rectRadius: 0.1, fill: { color: "ECFEFF" }, line: { color: C.cyan, width: 1 } });
  s.addText("Principios FIPA", { x: 0.9, y: 1.95, w: 5.3, h: 0.4, fontFace: "Calibri", fontSize: 16, bold: true, color: C.cyan });
  s.addText([
    { text: "FIPA (Foundation for Intelligent Physical Agents) es el estándar IEEE de facto para MAS interoperables.\n\n", options: { breakLine: true } },
    { text: "FIPA-ACL define un lenguaje de comunicación entre agentes basado en la teoría de actos de habla, con 12 campos de mensaje (performativo, contenido, ontología, protocolo, etc.).\n\n", options: { breakLine: true } },
    { text: "En nuestra simulación, el StateGraph de LangGraph cumple el rol de \"bus de coordinación\": cada nodo-agente pasa un estado estructurado compartido al siguiente, replicando el patrón de intercambio de mensajes de FIPA.", options: {} },
  ], { x: 0.9, y: 2.45, w: 5.3, h: 4.05, fontFace: "Calibri", fontSize: 12, color: C.slate, lineSpacingMultiple: 1.15 });

  s.addShape("roundRect", { x: 6.75, y: 1.75, w: 5.9, h: 4.9, rectRadius: 0.1, fill: { color: "FFF7ED" }, line: { color: C.amber, width: 1 } });
  s.addText("Modelo de responsabilidad compartida", { x: 7.05, y: 1.95, w: 5.3, h: 0.4, fontFace: "Calibri", fontSize: 16, bold: true, color: "C2410C" });
  s.addText([
    { text: "AWS, Azure y GCP: el proveedor asegura la nube (hardware, hipervisor, red física); el cliente asegura lo que hay dentro de la nube (datos, IAM, configuración de red, código).\n\n", options: { breakLine: true } },
    { text: "La mayoría de incidentes analizados (Capital One, exposiciones de S3) ocurren en el lado del cliente: es exactamente la superficie que el MAS propuesto monitorea de forma continua.\n\n", options: { breakLine: true } },
    { text: "Implicación de diseño: los agentes deben mapear sus reglas a los controles que el cliente sí controla (IAM, buckets, security groups, funciones serverless).", options: {} },
  ], { x: 7.05, y: 2.45, w: 5.3, h: 4.05, fontFace: "Calibri", fontSize: 12, color: C.slate, lineSpacingMultiple: 1.15 });
  footer(s, num());
}

module.exports = { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG, num };
