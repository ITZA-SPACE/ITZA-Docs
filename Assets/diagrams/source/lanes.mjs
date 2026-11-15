// Swimlane renderer in the Nadjet system-overview style, drawn in the ITZA dark design system.
// Lanes (dashed zones), cards, labelled orthogonal arrows and bottom info panels.
import { readFileSync } from "node:fs";
import { icons } from "./icons.mjs";

const LOGO = readFileSync(new URL("./logo-inner.txt", import.meta.url), "utf8");
const FONT = "Familjen Grotesk, DM Sans, Helvetica Neue, Helvetica, Arial, sans-serif";
export const HEAD = 150;
const INK = "#F5F5FA", INK2 = "#B4B4C8", INK3 = "#8C8CA6", RIM = "#8A8FA8", CARD = "#0B1226", PILL = "#0A0F22";
export const COL = {
  space: "#2F7BFF", rain: "#7FD0FF", green: "#34E0A1", amber: "#FFC857", violet: "#8B6BFF",
  red: "#FF5C7A", gcp: "#4285F4", grey: "#8A8FA8",
};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* Google Cloud product marks, drawn in the GCP icon language (rounded hexagon, white glyph).
   They are simplified stand-ins; swap in the official set from cloud.google.com/icons if needed. */
const hex = (c1 = "#5B9BFF", c2 = "#2F6FE0") =>
  `<defs><linearGradient id="gcpg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>` +
  `<path d="M50 4 L90 27 L90 73 L50 96 L10 73 L10 27 Z" fill="url(#gcpg)" stroke="#9CC2FF" stroke-width="2" stroke-linejoin="round"/>`;
export const gcp = {
  cloudrun: () => hex() + `<g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M32 30 L55 50 L32 70"/><path d="M52 30 L75 50 L52 70" opacity=".75"/></g>`,
  storage: () => hex() + `<g fill="#fff"><path d="M30 34 h40 l-4 34 a4 4 0 0 1 -4 3 h-24 a4 4 0 0 1 -4 -3 z" opacity=".95"/><rect x="26" y="28" width="48" height="8" rx="3"/></g>`,
  secret: () => hex() + `<g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"><circle cx="40" cy="50" r="10"/><path d="M50 50 H76 M66 50 V60 M74 50 V58"/></g>`,
  registry: () => hex() + `<g fill="#fff"><path d="M50 26 L72 38 L50 50 L28 38 Z"/><path d="M28 44 L50 56 L72 44 V58 L50 70 L28 58 Z" opacity=".8"/></g>`,
  iam: () => hex() + `<g fill="#fff"><circle cx="50" cy="38" r="9"/><path d="M32 70 a18 16 0 0 1 36 0 z"/></g>`,
  wif: () => hex() + `<g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"><path d="M50 26 L70 34 V52 C70 62 60 70 50 74 C40 70 30 62 30 52 V34 Z"/><path d="M41 50 L48 57 L60 44"/></g>`,
};

export class Lanes {
  constructor(W, H, title, subtitle) {
    this.W = W; this.H = H; this.title = title; this.subtitle = subtitle;
    this.parts = []; this.over = [];
  }
  /** Lane = dashed coloured zone with a title and a one-line subtitle. */
  lane(x, y, w, h, title, sub, color, tx = 22) {
    this.parts.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="${color}" fill-opacity=".05" stroke="${color}" stroke-width="3" stroke-dasharray="14 10"/>` +
        `<text x="${x + tx}" y="${y + 40}" font-size="27" font-weight="700" fill="${INK}">${esc(title)}</text>` +
        (sub ? `<text x="${x + tx}" y="${y + 70}" font-size="17" fill="${INK2}">${esc(sub)}</text>` : ""),
    );
  }
  /** Card: lines = [title, ...sublines]. icon = {gcp:name}|{icon:name,arg}. */
  card(x, y, w, h, color, title, subs = [], { icon, gcpIcon, tag, titleSize = 22, align } = {}) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="15" fill="${CARD}"/>` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="15" fill="${color}" fill-opacity=".16" stroke="${color}" stroke-width="2.5"/>`;
    const hasIcon = icon || gcpIcon;
    const isz = Math.min(64, h - 30);
    let cx = x + w / 2, anchor = "middle";
    if (hasIcon) {
      const ix = x + 16, iy = y + (h - isz) / 2;
      const inner = gcpIcon ? gcp[gcpIcon]() : icons[icon.name](icon.arg);
      s += `<g transform="translate(${ix} ${iy}) scale(${isz / 100})">${inner}</g>`;
      cx = x + 16 + isz + 16; anchor = "start";
    }
    if (align === "left") { anchor = "start"; cx = hasIcon ? cx : x + 20; }
    const avail = anchor === "middle" ? w - 28 : x + w - 14 - cx;
    const fit = (str, size, bold) => { const est = str.length * size * (bold ? 0.56 : 0.5); return est > avail ? Math.max(13, size * avail / est) : size; };
    const n = 1 + subs.length;
    const lh = 24, total = titleSize + (n - 1) * lh;
    let ty = y + (h - total) / 2 + titleSize * 0.82;
    s += `<text x="${cx}" y="${ty}" font-size="${fit(title, titleSize, true).toFixed(1)}" font-weight="700" fill="${INK}" text-anchor="${anchor}">${esc(title)}</text>`;
    for (const t of subs) {
      ty += lh;
      s += `<text x="${cx}" y="${ty}" font-size="${fit(t, 16.5, false).toFixed(1)}" fill="${INK2}" text-anchor="${anchor}">${esc(t)}</text>`;
    }
    if (tag) {
      const tw = tag.length * 8.6 + 22;
      s += `<rect x="${x + w - tw - 10}" y="${y - 13}" width="${tw}" height="26" rx="13" fill="${color}"/><text x="${x + w - tw / 2 - 10}" y="${y + 5}" font-size="14" font-weight="700" fill="#06060B" text-anchor="middle">${esc(tag)}</text>`;
    }
    this.parts.push(s);
  }
  /** Free illustration drawn straight onto a lane (like Nadjet's camera / console art). */
  art(name, x, y, size, arg) {
    this.parts.push(`<g transform="translate(${x} ${y}) scale(${size / 100})">${icons[name](arg)}</g>`);
  }
  /** Orthogonal arrow through points. label = string|string[] shown in a pill at labelAt=[x,y]. */
  arrow(pts, { label, labelAt, color = COL.space, both = false, dashed = false, head = true } = {}) {
    const id = "a" + color.slice(1);
    let s = `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linejoin="round" ${dashed ? 'stroke-dasharray="11 8"' : ""} ${head ? `marker-end="url(#${id})"` : ""} ${both ? `marker-start="url(#${id}s)"` : ""}/>`;
    this.parts.push(s);
    if (label) {
      const ls = Array.isArray(label) ? label : [label];
      const [lx, ly] = labelAt || pts[Math.floor(pts.length / 2) - 1 >= 0 ? Math.floor(pts.length / 2) - 1 : 0];
      const w = Math.max(...ls.map((l) => l.length)) * 8.6 + 20, h = ls.length * 21 + 10;
      let t = `<rect x="${lx - w / 2}" y="${ly - h / 2}" width="${w}" height="${h}" rx="9" fill="${PILL}" stroke="${RIM}" stroke-width="1.5"/>`;
      ls.forEach((l, i) => { t += `<text x="${lx}" y="${ly - h / 2 + 22 + i * 21 - 3}" font-size="15.5" font-weight="700" fill="${INK}" text-anchor="middle">${esc(l)}</text>`; });
      this.over.push(t);
    }
  }
  /** Bottom panel with a title and equal columns of [heading, ...lines]. */
  panel(x, y, w, h, title, cols, color = RIM) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#fff" fill-opacity=".04" stroke="${color}" stroke-width="2"/>` +
      `<text x="${x + 26}" y="${y + 42}" font-size="26" font-weight="700" fill="${INK}">${esc(title)}</text>`;
    const cw = (w - 52) / cols.length;
    cols.forEach(([head, ...lines], i) => {
      const cx = x + 26 + i * cw;
      s += `<text x="${cx}" y="${y + 88}" font-size="20" font-weight="700" fill="${COL.rain}">${esc(head)}</text>`;
      lines.forEach((l, j) => { s += `<text x="${cx}" y="${y + 118 + j * 24}" font-size="16.5" fill="${INK2}">${esc(l)}</text>`; });
    });
    this.parts.push(s);
  }
  svg() {
    const colors = [...new Set(Object.values(COL))];
    const H = this.H + HEAD;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.W}" height="${H}" viewBox="0 0 ${this.W} ${H}" font-family="${FONT}">`;
    s += `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06060B"/><stop offset="1" stop-color="#0B1B45"/></linearGradient>` +
      `<radialGradient id="glow" cx="0.88" cy="0.04" r="0.6"><stop offset="0" stop-color="${COL.rain}" stop-opacity=".26"/><stop offset="1" stop-color="${COL.rain}" stop-opacity="0"/></radialGradient>` +
      colors.map((c) => `<marker id="a${c.slice(1)}" markerUnits="userSpaceOnUse" markerWidth="22" markerHeight="22" refX="19" refY="11" orient="auto"><path d="M0,1 L20,11 L0,21 Z" fill="${c}"/></marker><marker id="a${c.slice(1)}s" markerUnits="userSpaceOnUse" markerWidth="22" markerHeight="22" refX="3" refY="11" orient="auto-start-reverse"><path d="M0,1 L20,11 L0,21 Z" fill="${c}"/></marker>`).join("") +
      `</defs><rect width="100%" height="100%" fill="url(#bg)"/><rect width="100%" height="100%" fill="url(#glow)"/>`;
    s += `<svg x="40" y="38" width="318" height="92" viewBox="0 0 94 27.1997" fill="none">${LOGO}</svg>`;
    s += `<text x="${this.W - 40}" y="84" font-size="42" font-weight="700" fill="${INK}" text-anchor="end">${esc(this.title)}</text>`;
    s += `<text x="${this.W - 40}" y="120" font-size="19" fill="${INK2}" text-anchor="end">${esc(this.subtitle)}</text>`;
    s += `<g transform="translate(0 ${HEAD})">${this.parts.join("")}${this.over.join("")}</g></svg>`;
    return s;
  }
}
