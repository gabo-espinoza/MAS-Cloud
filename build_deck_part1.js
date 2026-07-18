const pptxgen = require("./node_modules/pptxgenjs");
const path = require("path");

const FIG = path.join(__dirname, "figures");

// Paleta "Cyber Guardian"
const C = {
  navy: "0B1220",
  navy2: "0F172A",
  slate: "1E293B",
  cyan: "0891B2",
  cyan2: "06B6D4",
  amber: "F59E0B",
  green: "16A34A",
  red: "DC2626",
  ice: "E2E8F0",
  white: "FFFFFF",
  gray: "64748B",
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in

function darkSlide(title, kicker) {
  const s = pres.addSlide();
  s.background = { color: C.navy };
  if (kicker) {
    s.addText(kicker.toUpperCase(), {
      x: 0.6, y: 0.5, w: 12, h: 0.4, fontFace: "Calibri", fontSize: 13,
      color: C.cyan2, bold: true, charSpacing: 2,
    });
  }
  return s;
}

function lightSlide(title, opts = {}) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addText(title, {
    x: 0.6, y: 0.3, w: 12.1, h: 0.85, fontFace: "Cambria", fontSize: 32,
    color: C.navy2, bold: true,
  });
  if (opts.subtitle) {
    s.addText(opts.subtitle, {
      x: 0.6, y: 1.05, w: 12.1, h: 0.4, fontFace: "Calibri", fontSize: 14,
      color: C.gray, italic: true,
    });
  }
  return s;
}

function footer(s, n) {
  s.addText(`MAS para Ciberseguridad en la Nube  |  ${n}`, {
    x: 0.6, y: 7.15, w: 12, h: 0.3, fontFace: "Calibri", fontSize: 9,
    color: C.gray,
  });
}

function iconCircle(s, x, y, d, color, label) {
  s.addShape("ellipse", { x, y, w: d, h: d, fill: { color }, line: { color: C.navy2, width: 0.5 } });
  s.addText(label, { x, y, w: d, h: d, align: "center", valign: "middle",
    fontFace: "Calibri", fontSize: d > 0.6 ? 20 : 14, color: C.white, bold: true });
}

module.exports = { pres, C, darkSlide, lightSlide, footer, iconCircle, FIG };
