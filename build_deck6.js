const { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG, num } = require("./build_deck5.js");
const path = require("path");

// ============================================================ SLIDE 19 — Caso de estudio: timeline
{
  const s = lightSlide("Estudio de Caso — Brecha Capital One (2019)", { subtitle: "Sección 6 — Incidente histórico documentado" });
  s.addImage({ path: path.join(FIG, "capitalone_timeline.png"), x: 0.4, y: 1.75, w: 12.5, h: 4.6 });
  s.addText("106 millones de personas afectadas · Multa OCC de USD 80M (2020) · Vector: WAF mal configurado → SSRF → credenciales IAM con permisos excesivos → 700+ buckets S3 expuestos.", {
    x: 0.6, y: 6.45, w: 12, h: 0.55, fontFace: "Calibri", fontSize: 11, italic: true, color: C.slate,
  });
  footer(s, num());
}

// ============================================================ SLIDE 20 — Caso de estudio: lecciones
{
  const s = lightSlide("Estudio de Caso — Análisis Técnico y Lecciones Aprendidas", { subtitle: "Sección 6 — Relación con la solución MAS propuesta" });
  const rows = [
    ["Vector técnico", "SSRF sobre WAF mal configurado permitió consultar el servicio de metadatos y obtener credenciales IAM temporales con permisos excesivos (Khan et al., 2022)."],
    ["Falla de control", "Ausencia de monitoreo continuo de configuración (ConfigMonitorAgent habría detectado el rol IAM con permisos de listado/lectura excesivos antes de la explotación)."],
    ["Detección tardía", "El acceso no autorizado a 700+ buckets ocurrió durante meses sin alertas — un LogAnalysisAgent con ML habría marcado el patrón de solicitudes anómalas."],
    ["Respuesta", "No hubo contención automática; un ResponseAgent con consenso multiagente podría haber revocado las credenciales al detectar el patrón de acceso atípico."],
  ];
  let y = 1.85;
  rows.forEach((r, i) => {
    s.addShape("roundRect", { x: 0.6, y, w: 11.9, h: 1.15, rectRadius: 0.07, fill: { color: i % 2 === 0 ? "F8FAFC" : "FFFFFF" }, line: { color: "E2E8F0", width: 0.75 } });
    s.addShape("roundRect", { x: 0.8, y: y + 0.18, w: 2.1, h: 0.8, rectRadius: 0.06, fill: { color: C.red } });
    s.addText(r[0], { x: 0.8, y: y + 0.18, w: 2.1, h: 0.8, align: "center", valign: "middle", fontFace: "Calibri", fontSize: 11.5, bold: true, color: C.white });
    s.addText(r[1], { x: 3.15, y: y + 0.08, w: 9.2, h: 1.0, valign: "middle", fontFace: "Calibri", fontSize: 11, color: C.slate });
    y += 1.28;
  });
  footer(s, num());
}

// ============================================================ SLIDE 21 — Análisis crítico: ventajas
{
  const s = lightSlide("Análisis Crítico — Ventajas frente a Enfoques Tradicionales", { subtitle: "Sección 7 — Análisis crítico" });
  const adv = [
    ["Escalabilidad horizontal", "Cada agente monitorea un componente; agregar recursos cloud no requiere reescribir un motor SIEM monolítico."],
    ["Respuesta en tiempo real", "Decisiones locales y autónomas evitan la latencia de escalamiento a un SOC centralizado."],
    ["Correlación multifuente", "El consenso entre agentes reduce falsos positivos frente a reglas aisladas (SIEM tradicional basado en firmas)."],
    ["Adaptabilidad", "El LogAnalysisAgent puede reentrenarse con nuevos patrones sin reconfigurar todo el sistema."],
  ];
  adv.forEach((a, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = 0.6 + col * 6.15, by = 1.8 + row * 2.5;
    s.addShape("roundRect", { x: bx, y: by, w: 5.85, h: 2.25, rectRadius: 0.09, fill: { color: "F0FDF4" }, line: { color: C.green, width: 1.1 } });
    iconCircle(s, bx + 0.25, by + 0.25, 0.55, C.green, "✓");
    s.addText(a[0], { x: bx + 1.0, y: by + 0.18, w: 4.7, h: 0.5, fontFace: "Calibri", fontSize: 14, bold: true, color: "15803D" });
    s.addText(a[1], { x: bx + 1.0, y: by + 0.68, w: 4.7, h: 1.4, fontFace: "Calibri", fontSize: 11.5, color: C.slate });
  });
  footer(s, num());
}

// ============================================================ SLIDE 22 — Análisis crítico: limitaciones y ética
{
  const s = lightSlide("Análisis Crítico — Limitaciones y Retos Éticos", { subtitle: "Sección 7 — Análisis crítico" });
  s.addShape("roundRect", { x: 0.6, y: 1.75, w: 5.9, h: 4.9, rectRadius: 0.1, fill: { color: "FEF2F2" }, line: { color: C.red, width: 1 } });
  s.addText("Limitaciones técnicas y de datos", { x: 0.9, y: 1.95, w: 5.3, h: 0.4, fontFace: "Calibri", fontSize: 15, bold: true, color: "B91C1C" });
  s.addText([
    { text: "• Datos sintéticos: aunque inspirados en MITRE ATT&CK, no capturan toda la variabilidad de tráfico real de producción.\n\n", options: { breakLine: true } },
    { text: "• Falsos positivos en producción real suelen ser mayores que en entornos simulados controlados.\n\n", options: { breakLine: true } },
    { text: "• Coordinación entre muchos agentes introduce latencia de red y posibles cuellos de botella (mensajería FIPA-ACL a escala).\n\n", options: { breakLine: true } },
    { text: "• Costo computacional del reentrenamiento continuo de modelos ML por agente.", options: {} },
  ], { x: 0.9, y: 2.45, w: 5.3, h: 4.05, fontFace: "Calibri", fontSize: 11.5, color: C.slate, lineSpacingMultiple: 1.15 });

  s.addShape("roundRect", { x: 6.75, y: 1.75, w: 5.9, h: 4.9, rectRadius: 0.1, fill: { color: "FDF4FF" }, line: { color: "A21CAF", width: 1 } });
  s.addText("Retos éticos, legales y de privacidad", { x: 7.05, y: 1.95, w: 5.3, h: 0.4, fontFace: "Calibri", fontSize: 15, bold: true, color: "A21CAF" });
  s.addText([
    { text: "• Autonomía de respuesta: revocar credenciales o aislar instancias sin supervisión humana puede afectar continuidad operativa (falso positivo con impacto real).\n\n", options: { breakLine: true } },
    { text: "• Explicabilidad: decisiones de un Random Forest o de un agente LLM deben ser auditables para cumplir NIST CSF / ISO 27001.\n\n", options: { breakLine: true } },
    { text: "• Privacidad: el análisis de logs de acceso implica procesar metadatos potencialmente sensibles (IPs, identidades).\n\n", options: { breakLine: true } },
    { text: "• Responsabilidad: ¿quién responde legalmente por una acción autónoma incorrecta del ResponseAgent?", options: {} },
  ], { x: 7.05, y: 2.45, w: 5.3, h: 4.05, fontFace: "Calibri", fontSize: 11.5, color: C.slate, lineSpacingMultiple: 1.15 });
  footer(s, num());
}

// ============================================================ SLIDE 23 — Líneas futuras
{
  const s = lightSlide("Líneas Futuras de Investigación y Desarrollo", { subtitle: "Sección 7 — Análisis crítico" });
  const lines = [
    ["Agentes LLM explicables", "Sustituir el ThreatHuntingAgent por un agente basado en LLM (vía LangGraph) que redacte veredictos en lenguaje natural auditable."],
    ["MARL para respuesta óptima", "Incorporar aprendizaje por refuerzo multiagente (Finistrella et al., 2025) para optimizar políticas de contención bajo incertidumbre."],
    ["Validación en Kubernetes/serverless real", "Desplegar el MAS en un clúster de pruebas EKS/AKS con tráfico sintético a mayor escala."],
    ["Federación entre nubes", "Extender la coordinación FIPA-ACL a escenarios multi-cloud (AWS + Azure + GCP) para amenazas cross-cloud."],
  ];
  lines.forEach((l, i) => {
    const bx = 0.6 + (i % 2) * 6.15, by = 1.85 + Math.floor(i / 2) * 2.45;
    s.addShape("roundRect", { x: bx, y: by, w: 5.85, h: 2.2, rectRadius: 0.09, fill: { color: "F0F9FF" }, line: { color: C.cyan, width: 1.1 } });
    s.addText(l[0], { x: bx + 0.25, y: by + 0.18, w: 5.35, h: 0.5, fontFace: "Calibri", fontSize: 14, bold: true, color: C.cyan });
    s.addText(l[1], { x: bx + 0.25, y: by + 0.68, w: 5.35, h: 1.4, fontFace: "Calibri", fontSize: 11.5, color: C.slate });
  });
  footer(s, num());
}

module.exports = { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG, num };
