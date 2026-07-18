const { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG, num } = require("./build_deck6.js");

// ============================================================ SLIDE 24 — Conclusiones
{
  const s = darkSlide();
  s.addText("Conclusiones", { x: 0.6, y: 0.55, w: 11.5, h: 0.7, fontFace: "Cambria", fontSize: 30, bold: true, color: C.white });
  s.addText("Sección 8 — Síntesis de hallazgos", { x: 0.6, y: 1.2, w: 11.5, h: 0.4, fontFace: "Calibri", fontSize: 13, color: C.cyan2, italic: true });
  const points = [
    "Un MAS con agentes especializados (configuración, logs/ML, movimiento lateral, threat hunting y respuesta) cubre el ciclo completo de detección y contención en entornos cloud dinámicos.",
    "La simulación reproducible (LangGraph + Random Forest) alcanzó F1-macro = 0.990 y AUC-ROC = 0.996 sobre 1,800 eventos de prueba, validando la viabilidad técnica del enfoque.",
    "El consenso multiagente (≥2 agentes) permite automatizar el 74% de las respuestas sin sacrificar prudencia ante baja confianza, equilibrando autonomía y control.",
    "El caso Capital One confirma que la mayoría de brechas cloud ocurren en el lado del cliente del modelo de responsabilidad compartida — exactamente donde opera el MAS propuesto.",
  ];
  let y = 1.85;
  points.forEach((p) => {
    s.addShape("ellipse", { x: 0.65, y: y + 0.08, w: 0.14, h: 0.14, fill: { color: C.cyan2 }, line: { type: "none" } });
    s.addText(p, { x: 1.0, y, w: 11.3, h: 1.0, fontFace: "Calibri", fontSize: 13.5, color: C.ice, lineSpacingMultiple: 1.15 });
    y += 1.15;
  });
  footer(s, num());
}

// ============================================================ SLIDE 25 — Recomendaciones y reflexión
{
  const s = lightSlide("Recomendaciones y Reflexión Académica", { subtitle: "Sección 8 — Conclusiones" });
  s.addShape("roundRect", { x: 0.6, y: 1.75, w: 5.9, h: 4.9, rectRadius: 0.1, fill: { color: "F0F9FF" }, line: { color: C.cyan, width: 1 } });
  s.addText("Recomendaciones de implementación", { x: 0.9, y: 1.95, w: 5.3, h: 0.4, fontFace: "Calibri", fontSize: 14.5, bold: true, color: C.cyan });
  s.addText([
    { text: "1. Iniciar con agentes reactivos (Config/Log) antes de habilitar respuesta autónoma total.\n\n", options: { breakLine: true } },
    { text: "2. Mapear cada regla de detección a controles CSA CCM y técnicas MITRE ATT&CK for Cloud para trazabilidad de auditoría.\n\n", options: { breakLine: true } },
    { text: "3. Establecer umbrales de consenso configurables por criticidad del recurso.\n\n", options: { breakLine: true } },
    { text: "4. Registrar toda acción autónoma en un log inmutable para cumplimiento (NIST CSF, ISO 27001).", options: {} },
  ], { x: 0.9, y: 2.45, w: 5.3, h: 4.05, fontFace: "Calibri", fontSize: 11.5, color: C.slate, lineSpacingMultiple: 1.15 });

  s.addShape("roundRect", { x: 6.75, y: 1.75, w: 5.9, h: 4.9, rectRadius: 0.1, fill: { color: "FFFBEB" }, line: { color: C.amber, width: 1 } });
  s.addText("Reflexión del grupo", { x: 7.05, y: 1.95, w: 5.3, h: 0.4, fontFace: "Calibri", fontSize: 14.5, bold: true, color: "B45309" });
  s.addText("El desarrollo de este proyecto permitió comprender que la seguridad en la nube no es un problema puramente técnico, sino de coordinación: los sistemas multiagente ofrecen un marco natural para modelar la naturaleza distribuida de las amenazas cloud modernas. Implementar la simulación con LangGraph evidenció, en la práctica, cómo los principios clásicos de MAS (FIPA, autonomía, sociabilidad) siguen vigentes incluso en arquitecturas modernas basadas en grafos de estado y aprendizaje automático.", {
    x: 7.05, y: 2.45, w: 5.3, h: 4.05, fontFace: "Calibri", fontSize: 12, color: C.slate, lineSpacingMultiple: 1.2,
  });
  footer(s, num());
}

// ============================================================ SLIDE 26 — Referencias APA (1)
{
  const s = lightSlide("Referencias (APA 7.ª edición)", { subtitle: "Artículos científicos indexados" });
  const refs = [
    "Finistrella, S., Mariani, S., & Zambonelli, F. (2025). Multi-agent reinforcement learning for cybersecurity: Classification and survey. Intelligent Systems with Applications, 26, Article 100487.",
    "Javadpour, A., Pinto, P., Ja'fari, F., & Zhang, W. (2023). DMAIDPS: A distributed multi-agent intrusion detection and prevention system for cloud IoT environments. Cluster Computing, 26, 367–384. https://doi.org/10.1007/s10586-022-03621-3",
    "Khan, S., Kabanov, I., Hua, Y., & Madnick, S. (2022). A systematic analysis of the Capital One data breach: Critical lessons learned. ACM Transactions on Privacy and Security, 26(1), Article 3. https://doi.org/10.1145/3546068",
    "Smiliotopoulos, C., Kambourakis, G., & Barbatsalou, K. (2023). On the detection of lateral movement through supervised machine learning and an open-source tool to create turnkey datasets from Sysmon logs. International Journal of Information Security, 22, 1893–1919. https://doi.org/10.1007/s10207-023-00725-8",
    "Smiliotopoulos, C., Kambourakis, G., & Kolias, C. (2024). Detecting lateral movement: A systematic survey. Heliyon, 10(4), Article e26317. https://doi.org/10.1016/j.heliyon.2024.e26317",
  ];
  s.addText(refs.map((r) => ({ text: r, options: { breakLine: true, indentLevel: 0 } })), {
    x: 0.6, y: 1.85, w: 12.0, h: 4.9, fontFace: "Calibri", fontSize: 12, color: C.slate, lineSpacingMultiple: 1.35,
    paraSpaceAfter: 12, indentLevel: 1, bullet: false,
  });
  footer(s, num());
}

// ============================================================ SLIDE 27 — Referencias APA (2)
{
  const s = lightSlide("Referencias (APA 7.ª edición)", { subtitle: "Reportes de industria, estándares y páginas web (máx. 2, con fecha de consulta)" });
  const refs = [
    "Cloud Security Alliance. (2024). Cloud Controls Matrix (CCM) v4.1. Recuperado el 14 de julio de 2026, de https://cloudsecurityalliance.org/research/cloud-controls-matrix",
    "IBM. (2025). Cost of a data breach report 2025. IBM Security.",
    "MITRE. (2026). ATT&CK for Cloud: Enterprise matrix. Recuperado el 14 de julio de 2026, de https://attack.mitre.org/matrices/enterprise/cloud/",
    "OWASP Foundation. (2026). Cloud-Native Application Security Top 10. OWASP.",
    "Verizon. (2025). 2025 data breach investigations report. Verizon Business.",
  ];
  s.addText(refs.map((r) => ({ text: r, options: { breakLine: true } })), {
    x: 0.6, y: 1.85, w: 12.0, h: 4.0, fontFace: "Calibri", fontSize: 12, color: C.slate, lineSpacingMultiple: 1.35, paraSpaceAfter: 12,
  });
  s.addText("Nota: los datos de simulación son sintéticos y reproducibles (semilla fija). El repositorio de código debe referenciarse con su URL definitiva de GitHub/Colab antes de la sustentación final.", {
    x: 0.6, y: 6.15, w: 12.0, h: 0.7, fontFace: "Calibri", fontSize: 10, italic: true, color: C.gray,
  });
  footer(s, num());
}

pres.writeFile({ fileName: "MAS_Ciberseguridad_Cloud.pptx" }).then(() => {
  console.log("Presentación generada: MAS_Ciberseguridad_Cloud.pptx");
});
