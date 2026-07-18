const { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG, num } = require("./build_deck2.js");

// ============================================================ SLIDE 8 — OWASP + amenazas
{
  const s = lightSlide("Amenazas Cloud: OWASP Cloud-Native Top 10", { subtitle: "Sección 3 — Bases técnicas y conceptuales" });
  const rows = [
    ["A02", "Security Misconfiguration", "ACLs públicas, cifrado deshabilitado, IaC sin revisión de seguridad"],
    ["—", "Identity & Access Mismanagement", "Roles IAM con permisos de comodín (*), ausencia de MFA"],
    ["—", "SSRF / API insegura", "Explotación del servicio de metadatos de instancias (caso Capital One)"],
    ["—", "Insufficient Supply-Chain Verification", "Dependencias e imágenes de contenedor no verificadas"],
  ];
  let y = 1.85;
  rows.forEach((r, i) => {
    s.addShape("roundRect", { x: 0.6, y, w: 11.9, h: 1.0, rectRadius: 0.06,
      fill: { color: i % 2 === 0 ? "F8FAFC" : "FFFFFF" }, line: { color: "E2E8F0", width: 0.75 } });
    s.addShape("roundRect", { x: 0.8, y: y + 0.18, w: 0.9, h: 0.64, rectRadius: 0.08, fill: { color: C.navy2 } });
    s.addText(r[0], { x: 0.8, y: y + 0.18, w: 0.9, h: 0.64, align: "center", valign: "middle", fontFace: "Calibri", fontSize: 13, bold: true, color: C.cyan2 });
    s.addText(r[1], { x: 1.95, y: y + 0.1, w: 4.1, h: 0.8, valign: "middle", fontFace: "Calibri", fontSize: 13.5, bold: true, color: C.navy2 });
    s.addText(r[2], { x: 6.2, y: y + 0.1, w: 6.15, h: 0.8, valign: "middle", fontFace: "Calibri", fontSize: 11.5, color: C.slate });
    y += 1.12;
  });
  s.addText("Fuente: OWASP Cloud-Native Application Security Top 10 (OWASP, 2026); IBM Cost of a Data Breach Report (IBM, 2025).", {
    x: 0.6, y: 6.35, w: 11.9, h: 0.3, fontFace: "Calibri", fontSize: 9.5, color: C.gray, italic: true });
  footer(s, num());
}

// ============================================================ SLIDE 9 — CSA CCM + MITRE ATT&CK
{
  const s = lightSlide("Marcos de Referencia: CSA CCM y MITRE ATT&CK for Cloud", { subtitle: "Sección 3 — Bases técnicas y conceptuales" });
  s.addShape("roundRect", { x: 0.6, y: 1.75, w: 5.9, h: 4.9, rectRadius: 0.1, fill: { color: "F0FDF4" }, line: { color: C.green, width: 1 } });
  s.addText("CSA Cloud Controls Matrix (CCM v4.1)", { x: 0.9, y: 1.95, w: 5.3, h: 0.4, fontFace: "Calibri", fontSize: 15.5, bold: true, color: "15803D" });
  s.addText([
    { text: "207 controles agrupados en 17 dominios (IAM, Gobernanza y Riesgo, Infraestructura y Virtualización, Seguridad de Datos, entre otros).\n\n", options: { breakLine: true } },
    { text: "Los agentes de ConfigMonitorAgent mapean sus reglas de detección directamente a controles del dominio IAM e Infraestructura del CCM.\n\n", options: { breakLine: true } },
    { text: "Sirve como checklist de auditoría continua: cada alerta generada puede trazarse a un control CCM incumplido.", options: {} },
  ], { x: 0.9, y: 2.45, w: 5.3, h: 4.05, fontFace: "Calibri", fontSize: 12, color: C.slate, lineSpacingMultiple: 1.15 });

  s.addShape("roundRect", { x: 6.75, y: 1.75, w: 5.9, h: 4.9, rectRadius: 0.1, fill: { color: "FEF2F2" }, line: { color: C.red, width: 1 } });
  s.addText("MITRE ATT&CK for Cloud", { x: 7.05, y: 1.95, w: 5.3, h: 0.4, fontFace: "Calibri", fontSize: 15.5, bold: true, color: "B91C1C" });
  s.addText([
    { text: "Matriz Enterprise filtrada a plataformas IaaS, SaaS, Identity Provider y Office Suite.\n\n", options: { breakLine: true } },
    { text: "Tácticas relevantes para el MAS propuesto: TA0004 (Escalada de Privilegios), TA0008 (Movimiento Lateral) y TA0010 (Exfiltración) — usadas como base para etiquetar el dataset sintético de la simulación.\n\n", options: { breakLine: true } },
    { text: "Las técnicas se observan en telemetría de control-plane (CloudTrail, Azure Activity Log), la misma fuente que consume el LogAnalysisAgent.", options: {} },
  ], { x: 7.05, y: 2.45, w: 5.3, h: 4.05, fontFace: "Calibri", fontSize: 12, color: C.slate, lineSpacingMultiple: 1.15 });
  footer(s, num());
}

// ============================================================ SLIDE 10 — Frameworks comparación
{
  const s = lightSlide("Evaluación de Frameworks para Implementar el MAS", { subtitle: "Sección 3 — Bases técnicas y conceptuales" });
  const headers = ["Framework", "Paradigma", "Fortaleza", "Uso en este proyecto"];
  const data = [
    ["JADE", "MAS clásico (Java, FIPA-compliant)", "Cumplimiento estricto de estándares FIPA-ACL", "Referencia conceptual de interoperabilidad"],
    ["Mesa", "Modelado basado en agentes (Python)", "Simulación de sistemas complejos y visualización", "Alternativa evaluada para el motor de simulación"],
    ["AutoGen", "Agentes conversacionales LLM", "Orquestación de diálogo multiagente con LLM", "Extensión futura para agentes de razonamiento"],
    ["LangGraph", "Grafo de estados para agentes LLM/híbridos", "Control explícito de flujo, estado compartido, reproducible", "Framework elegido para orquestar los 5 agentes"],
  ];
  let y = 1.9;
  const colW = [1.7, 3.0, 3.7, 3.5];
  const colX = [0.6, 2.3, 5.3, 9.0];
  headers.forEach((h, i) => {
    s.addShape("rect", { x: colX[i], y, w: colW[i], h: 0.55, fill: { color: C.navy2 } });
    s.addText(h, { x: colX[i], y, w: colW[i], h: 0.55, valign: "middle", align: "center", fontFace: "Calibri", fontSize: 12.5, bold: true, color: C.white });
  });
  y += 0.55;
  data.forEach((row, ri) => {
    const rh = 1.0;
    row.forEach((cell, ci) => {
      const isLast = ri === data.length - 1;
      s.addShape("rect", { x: colX[ci], y, w: colW[ci], h: rh,
        fill: { color: isLast ? "CFFAFE" : (ri % 2 === 0 ? "F8FAFC" : "FFFFFF") }, line: { color: "E2E8F0", width: 0.5 } });
      s.addText(cell, { x: colX[ci] + 0.08, y, w: colW[ci] - 0.16, h: rh, valign: "middle", fontFace: "Calibri",
        fontSize: 11, bold: ci === 0, color: ci === 0 ? C.navy2 : C.slate });
    });
    y += rh;
  });
  footer(s, num());
}

module.exports = { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG, num };
