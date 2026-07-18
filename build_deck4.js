const { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG, num } = require("./build_deck3.js");
const path = require("path");

// ============================================================ SLIDE 11 — Arquitectura propuesta
{
  const s = lightSlide("Arquitectura Propuesta del Sistema Multiagente", { subtitle: "Sección 3 — Arquitectura de la solución (notación C4 + flujo de datos)" });
  s.addImage({ path: path.join(FIG, "architecture_diagram.png"), x: 0.55, y: 1.65, w: 12.2, h: 7.03 * (12.2/13) * 0 + 5.15 });
  footer(s, num());
}

// ============================================================ SLIDE 12 — Revisión bibliográfica
{
  const s = lightSlide("Investigación y Revisión Bibliográfica", { subtitle: "Sección 4 — Hallazgos clave de la literatura reciente (2022–2025)" });
  const items = [
    ["Javadpour et al. (2023)", "DMAIDPS: sistema de detección/prevención multiagente distribuido para IoT-cloud; agentes de aprendizaje en 6 pasos clasifican tráfico normal vs. ataque.", C.cyan],
    ["Smiliotopoulos et al. (2023, 2024)", "Metodología supervisada y encuesta sistemática (2015–2023) sobre detección de movimiento lateral vía logs Sysmon y técnicas ML/grafos.", C.amber],
    ["Finistrella et al. (2025)", "Clasificación y encuesta de aprendizaje por refuerzo multiagente (MARL) aplicado a ciberdefensa de red.", C.green],
    ["Khan et al. (2022)", "Análisis sistemático (metodología CAST) de la brecha Capital One: fallas de control desde lo técnico hasta la gobernanza.", C.red],
  ];
  let y = 1.85;
  items.forEach((it) => {
    s.addShape("roundRect", { x: 0.6, y, w: 11.9, h: 1.12, rectRadius: 0.07, fill: { color: "F8FAFC" }, line: { color: it[2], width: 1.1 } });
    s.addText(it[0], { x: 0.85, y: y + 0.08, w: 3.6, h: 0.96, valign: "middle", fontFace: "Calibri", fontSize: 13, bold: true, color: it[2] });
    s.addText(it[1], { x: 4.5, y: y + 0.08, w: 7.85, h: 0.96, valign: "middle", fontFace: "Calibri", fontSize: 11.5, color: C.slate });
    y += 1.27;
  });
  footer(s, num());
}

// ============================================================ SLIDE 13 — Simulación: entradas
{
  const s = lightSlide("Simulación Práctica — Entradas del Modelo", { subtitle: "Sección 5 — Dataset sintético tipo CloudTrail" });
  s.addShape("roundRect", { x: 0.6, y: 1.75, w: 6.9, h: 4.9, rectRadius: 0.1, fill: { color: "F8FAFC" }, line: { color: "E2E8F0", width: 1 } });
  s.addText("6,000 eventos sintéticos generados con semilla fija (reproducible)", { x: 0.9, y: 1.95, w: 6.3, h: 0.4, fontFace: "Calibri", fontSize: 13.5, bold: true, color: C.navy2 });
  s.addText([
    { text: "Variables por evento: acción (API call), entropía de IP origen, solicitudes/min, recursos distintos tocados, ACL pública, permisos IAM comodín, MB transferidos, rol nuevo asumido, horario, MFA.\n\n", options: { breakLine: true } },
    { text: "4 clases etiquetadas según MITRE ATT&CK for Cloud:\n", options: { breakLine: true, bold: true } },
    { text: "   • Benigno (82.0%) — 4,920 eventos\n", options: { breakLine: true } },
    { text: "   • Misconfiguration (8.0%) — 480 eventos\n", options: { breakLine: true } },
    { text: "   • Movimiento lateral (6.0%) — 360 eventos\n", options: { breakLine: true } },
    { text: "   • Exfiltración (4.0%) — 240 eventos\n\n", options: { breakLine: true } },
    { text: "Justificación: no se usan logs reales de producción por confidencialidad; el generador estocástico replica distribuciones inspiradas en MITRE ATT&CK y el caso Capital One.", options: {} },
  ], { x: 0.9, y: 2.45, w: 6.3, h: 4.05, fontFace: "Calibri", fontSize: 11.5, color: C.slate, lineSpacingMultiple: 1.12 });

  s.addShape("roundRect", { x: 7.75, y: 1.75, w: 4.9, h: 4.9, rectRadius: 0.1, fill: { color: C.navy2 } });
  s.addText("Ejemplo de evento (fila del CSV)", { x: 8.0, y: 1.95, w: 4.4, h: 0.35, fontFace: "Calibri", fontSize: 12.5, bold: true, color: C.cyan2 });
  const sample = [
    "event_id: EVT-002471", "action: PutBucketAcl", "is_public_acl: 1",
    "iam_wildcard_permissions: 1", "requests_per_min: 3", "data_transfer_mb: 2.14",
    "off_hours: 1", "mfa_present: 0", "label: 1 (misconfiguration)",
  ];
  s.addText(sample.map((l) => ({ text: l, options: { breakLine: true } })), {
    x: 8.0, y: 2.4, w: 4.4, h: 4.1, fontFace: "Courier New", fontSize: 11, color: C.ice, lineSpacingMultiple: 1.35,
  });
  footer(s, num());
}

module.exports = { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG, num };
