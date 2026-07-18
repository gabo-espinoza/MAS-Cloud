const { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG } = require("./build_deck_part1.js");
let n = 0;
function num() { n += 1; return n; }

// ============================================================ SLIDE 1
{
  const s = darkSlide();
  s.addShape("ellipse", { x: 10.6, y: -1.5, w: 5, h: 5, fill: { color: C.slate, transparency: 40 }, line: { type: "none" } });
  s.addShape("ellipse", { x: -1.8, y: 5.2, w: 4.2, h: 4.2, fill: { color: C.cyan, transparency: 78 }, line: { type: "none" } });
  s.addText("SISTEMAS MULTIAGENTE PARA CIBERSEGURIDAD", {
    x: 0.8, y: 2.15, w: 11.7, h: 0.5, fontFace: "Calibri", fontSize: 15, color: C.cyan2, bold: true, charSpacing: 3,
  });
  s.addText("Detección y Respuesta Autónoma en Entornos de Computación en la Nube", {
    x: 0.8, y: 2.65, w: 11.7, h: 1.7, fontFace: "Cambria", fontSize: 38, color: C.white, bold: true,
  });
  s.addText("Diseño, simulación y evaluación de una arquitectura MAS orquestada con LangGraph para IaaS/PaaS/SaaS", {
    x: 0.8, y: 4.35, w: 10.5, h: 0.6, fontFace: "Calibri", fontSize: 15, color: C.ice, italic: true,
  });
  s.addShape("line", { x: 0.85, y: 5.15, w: 3.2, h: 0, line: { color: C.cyan2, width: 2 } });
  s.addText([
    { text: "Equipo:  ", options: { bold: true, color: C.cyan2 } },
    { text: "Gabriel Agudo   ·   Gabriel Espinoza   ·   Victor Martinez", options: { color: C.white } },
  ], { x: 0.8, y: 5.35, w: 11, h: 0.4, fontFace: "Calibri", fontSize: 14 });
  s.addText("Sustentación académica — Inteligencia Artificial aplicada a la Ciberseguridad", {
    x: 0.8, y: 6.75, w: 11, h: 0.35, fontFace: "Calibri", fontSize: 11, color: C.gray,
  });
}

// ============================================================ SLIDE 2 — Agenda / objetivos
{
  const s = lightSlide("Presentación del Equipo y Objetivos", { subtitle: "Sección 1 — Contextualización y hoja de ruta de la sustentación" });
  const items = [
    ["Contexto del problema", "Panorama global de amenazas en la nube: estadísticas, impacto empresarial y social."],
    ["Bases técnicas", "Principios MAS, IA aplicada, arquitectura propuesta y marco de estándares (FIPA, OWASP, CSA, MITRE)."],
    ["Simulación práctica", "Sistema multiagente reproducible en Python + LangGraph con métricas cuantitativas."],
    ["Estudio de caso", "Brecha Capital One (2019): vectores técnicos y lecciones aplicadas al diseño MAS."],
    ["Análisis crítico", "Ventajas, límites, ética y líneas futuras de investigación."],
    ["Conclusiones", "Síntesis, recomendaciones de implementación y reflexión académica."],
  ];
  const colors = [C.cyan, C.amber, C.green, C.red, C.slate, C.navy2];
  let x = 0.6, y = 1.75;
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = 0.6 + col * 6.15, by = 1.7 + row * 1.65;
    s.addShape("roundRect", { x: bx, y: by, w: 5.85, h: 1.42, rectRadius: 0.08,
      fill: { color: "F8FAFC" }, line: { color: "E2E8F0", width: 1 },
      shadow: { type: "outer", color: "94A3B8", opacity: 0.25, blur: 6, offset: 2, angle: 90 } });
    iconCircle(s, bx + 0.25, by + 0.26, 0.55, colors[i], String(i + 1));
    s.addText(it[0], { x: bx + 1.0, y: by + 0.12, w: 4.7, h: 0.4, fontFace: "Calibri", fontSize: 15.5, bold: true, color: C.navy2 });
    s.addText(it[1], { x: bx + 1.0, y: by + 0.52, w: 4.7, h: 0.8, fontFace: "Calibri", fontSize: 11, color: C.gray });
  });
  footer(s, num());
}

// ============================================================ SLIDE 3 — Contexto global
{
  const s = lightSlide("El Problema en el Panorama Global de Ciberseguridad", { subtitle: "Sección 2 — Contexto del problema" });
  const stats = [
    ["30%", "de las brechas involucran a un tercero — se duplicó en un año (Verizon, 2025)"],
    ["44%", "de las brechas confirmadas incluyeron ransomware, frente al 32% del año anterior (Verizon, 2025)"],
    ["USD 4.44M", "costo global promedio de una brecha de datos en 2025 (IBM, 2025)"],
    ["258 días", "tiempo promedio para identificar y contener brechas causadas por misconfiguration cloud (IBM, 2025)"],
  ];
  stats.forEach((st, i) => {
    const bx = 0.6 + i * 3.08;
    s.addShape("roundRect", { x: bx, y: 1.8, w: 2.85, h: 2.0, rectRadius: 0.1,
      fill: { color: C.navy2 } });
    s.addText(st[0], { x: bx, y: 2.0, w: 2.85, h: 0.85, align: "center", fontFace: "Cambria", fontSize: 32, bold: true, color: C.cyan2 });
    s.addText(st[1], { x: bx + 0.18, y: 2.85, w: 2.5, h: 0.85, align: "center", fontFace: "Calibri", fontSize: 10.5, color: C.ice });
  });
  s.addText("El modelo de responsabilidad compartida (AWS, Azure, GCP) delega en el cliente la seguridad \"dentro\" de la nube (configuración de IAM, datos, red), precisamente el punto donde ocurren la mayoría de los incidentes reportados.", {
    x: 0.6, y: 4.15, w: 11.9, h: 0.9, fontFace: "Calibri", fontSize: 13.5, color: C.slate, italic: true,
  });
  s.addShape("roundRect", { x: 0.6, y: 5.15, w: 11.9, h: 1.85, rectRadius: 0.08, fill: { color: "FEF3C7" }, line: { color: "F59E0B", width: 1 } });
  s.addText("Vectores de ataque más comunes en cloud (OWASP / MITRE ATT&CK for Cloud):", {
    x: 0.85, y: 5.28, w: 11.4, h: 0.3, fontFace: "Calibri", fontSize: 12.5, bold: true, color: "92400E" });
  s.addText([
    { text: "•  Misconfiguration de buckets/IAM (acceso público, políticas con comodín)", options: { breakLine: true } },
    { text: "•  Server-Side Request Forgery (SSRF) contra el servicio de metadatos de la instancia", options: { breakLine: true } },
    { text: "•  Escalación de privilegios y movimiento lateral entre roles/cuentas", options: { breakLine: true } },
    { text: "•  Exfiltración de datos vía APIs de almacenamiento o funciones serverless", options: { breakLine: true } },
  ], { x: 0.85, y: 5.62, w: 11.4, h: 1.3, fontFace: "Calibri", fontSize: 11, color: "78350F", lineSpacingMultiple: 1.0, paraSpaceAfter: 4 });
  footer(s, num());
}

// ============================================================ SLIDE 4 — Impacto empresarial y social
{
  const s = lightSlide("Impacto Empresarial y Social", { subtitle: "Sección 2 — Contexto del problema" });
  s.addShape("roundRect", { x: 0.6, y: 1.75, w: 5.9, h: 4.9, rectRadius: 0.1, fill: { color: "F0F9FF" }, line: { color: C.cyan, width: 1 } });
  s.addText("Impacto empresarial", { x: 0.9, y: 1.95, w: 5.3, h: 0.4, fontFace: "Calibri", fontSize: 16, bold: true, color: C.cyan });
  s.addText([
    { text: "Servicios financieros, salud y retail concentran el mayor volumen de incidentes cloud reportados por su alto valor de datos.\n\n", options: { breakLine: true } },
    { text: "Costos operacionales: sanciones regulatorias (ej. USD 80M OCC a Capital One), remediación forense, pérdida de disponibilidad (SLA) y fuga de clientes.\n\n", options: { breakLine: true } },
    { text: "Cadena de suministro: el 30% de las brechas involucra proveedores/terceros integrados vía APIs cloud.", options: {} },
  ], { x: 0.9, y: 2.45, w: 5.3, h: 4.05, fontFace: "Calibri", fontSize: 12.5, color: C.slate, lineSpacingMultiple: 1.15 });

  s.addShape("roundRect", { x: 6.75, y: 1.75, w: 5.9, h: 4.9, rectRadius: 0.1, fill: { color: "FDF4FF" }, line: { color: "A21CAF", width: 1 } });
  s.addText("Impacto social", { x: 7.05, y: 1.95, w: 5.3, h: 0.4, fontFace: "Calibri", fontSize: 16, bold: true, color: "A21CAF" });
  s.addText([
    { text: "Privacidad: exposición de datos personales sensibles (identidad, salud, finanzas) a escala masiva (106M de personas en el caso Capital One).\n\n", options: { breakLine: true } },
    { text: "Infraestructura crítica: dependencia creciente de proveedores cloud para servicios esenciales (energía, salud, gobierno digital).\n\n", options: { breakLine: true } },
    { text: "Confianza ciudadana: erosión de la confianza digital y necesidad de marcos de gobernanza y transparencia algorítmica.", options: {} },
  ], { x: 7.05, y: 2.45, w: 5.3, h: 4.05, fontFace: "Calibri", fontSize: 12.5, color: C.slate, lineSpacingMultiple: 1.15 });
  footer(s, num());
}

module.exports = { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG, num };
