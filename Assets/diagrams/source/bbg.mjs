import { icons, C } from "./icons.mjs";
import { readFileSync } from "node:fs";
const LOGO = readFileSync(new URL("./logo-inner.txt", import.meta.url), "utf8");
const HEAD = 150; // header band height for the logo
const INK = "#081730", INK2 = "#4A5876", RIM = "#8FA3CC", SPACE = "#2F7BFF", RAIN = "#7FD0FF";

const FONT = "Familjen Grotesk, DM Sans, Helvetica Neue, Helvetica, Arial, sans-serif";
const LABEL = 30, SUB = 22, ARROW = 25, TITLE = 46;
const tw = (s, size) => s.length * size * 0.52;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

export class Canvas {
  constructor(W, H, title) {
    this.W = W; this.H = H + HEAD; this.title = title;
    this.groups = []; this.arrows = []; this.nodes = {}; this.texts = [];
  }

  node(id, { x, y, icon, size = 130, label = "", sub = "", arg }) {
    const L = label ? label.split("\n") : [];
    const S = sub ? sub.split("\n") : [];
    const w = Math.max(size, ...L.map((l) => tw(l, LABEL)), ...S.map((l) => tw(l, SUB)));
    const bottom = y + size / 2 + (L.length ? 14 + L.length * 34 : 0) + S.length * 27;
    const n = { id, x, y, icon, size, L, S, arg, l: x - w / 2, r: x + w / 2, t: y - size / 2, b: bottom, w };
    this.nodes[id] = n;
    return n;
  }

  /** Anchor point just outside a node's box (icon + label). */
  P(n, side, off = 0, gap = 16) {
    if (side === "t") return [n.x + off, n.t - gap];
    if (side === "b") return [n.x + off, n.b + gap];
    if (side === "l") return [n.l - gap, n.y + off];
    return [n.r + gap, n.y + off];
  }

  group(rect, label, { style = "dash", labelAt = "tl", fs = LABEL } = {}) {
    this.groups.push({ ...rect, label, style, fs, labelAt });
  }

  /** rect around nodes */
  around(ns, pad = 50, top = 70) {
    const l = Math.min(...ns.map((n) => n.l)) - pad, r = Math.max(...ns.map((n) => n.r)) + pad;
    const t = Math.min(...ns.map((n) => n.t)) - top, b = Math.max(...ns.map((n) => n.b)) + pad;
    return { x: l, y: t, w: r - l, h: b - t };
  }

  arrow(from, to, { label = "", n = 0, color = "blue", dashed = false, via = [], seg = null, side = 1, at = 0.5 } = {}) {
    this.arrows.push({ pts: [from, ...via, to], label, n, color, dashed, seg, side, at });
  }

  text(x, y, s, { size = LABEL, color = "#111", anchor = "start", bold = false } = {}) {
    this.texts.push({ x, y, s, size, color, anchor, bold });
  }

  svg() {
    const col = { blue: SPACE, green: "#128886", purple: C.P };
    let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.W}" height="${this.H}" viewBox="0 0 ${this.W} ${this.H}" font-family="${FONT}">`;
    s += `<defs>${Object.entries(col).map(([k, c]) => `<marker id="m-${k}" markerUnits="userSpaceOnUse" markerWidth="26" markerHeight="26" refX="22" refY="13" orient="auto"><path d="M0,1 L24,13 L0,25 Z" fill="${c}"/></marker>`).join("")}</defs>`;
    s += `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF0FA"/><stop offset="1" stop-color="#DDE6F5"/></linearGradient><radialGradient id="glow" cx="0.85" cy="0.05" r="0.7"><stop offset="0" stop-color="${RAIN}" stop-opacity=".45"/><stop offset="1" stop-color="${RAIN}" stop-opacity="0"/></radialGradient><linearGradient id="aurora" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${RAIN}"/><stop offset="1" stop-color="${SPACE}"/></linearGradient></defs>`;
    s += `<rect width="100%" height="100%" fill="url(#bg)"/><rect width="100%" height="100%" fill="url(#glow)"/>`;
    s += `<svg x="60" y="44" width="318" height="92" viewBox="0 0 94 27.1997" fill="none">${LOGO}</svg>`;
    if (this.title) s += `<text x="${this.W - 60}" y="104" font-size="${TITLE}" font-weight="700" fill="${INK}" text-anchor="end">${esc(this.title)}</text>`;
    s += `<g transform="translate(0 ${HEAD})">`;
    for (const g of this.groups) {
      const stroke = g.style === "purple" ? C.P : RIM;
      const dash = g.style === "solid" || g.style === "purple" ? "" : 'stroke-dasharray="18 12"';
      const fill = g.style === "fill" ? "#DDE6F5" : "#FFFFFF";
      const rx = Math.min(70, g.h / 5);
      s += `<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="${Math.min(rx, 40)}" fill="${fill}" fill-opacity=".7" stroke="${stroke}" stroke-width="${g.style === "solid" ? 5 : 4.5}" ${dash}/>`;
      if (g.label) s += `<text x="${g.x + 34}" y="${g.y + 52}" font-size="${g.fs}" fill="${INK}" font-weight="700">${esc(g.label)}</text>`;
    }
    for (const t of this.texts) s += `<text x="${t.x}" y="${t.y}" font-size="${t.size}" fill="${t.color}" text-anchor="${t.anchor}" ${t.bold ? 'font-weight="700"' : ""}>${esc(t.s)}</text>`;
    for (const a of this.arrows) {
      const c = col[a.color];
      s += `<polyline points="${a.pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="4.5" stroke-linejoin="round" ${a.dashed ? 'stroke-dasharray="14 10"' : ""} marker-end="url(#m-${a.color})"/>`;
      // label along the longest (or chosen) segment
      let si = a.seg;
      if (si == null) {
        let best = -1;
        a.pts.slice(1).forEach((p, i) => { const d = Math.hypot(p[0] - a.pts[i][0], p[1] - a.pts[i][1]); if (d > best) { best = d; si = i; } });
      }
      const [p0, p1] = [a.pts[si], a.pts[si + 1]];
      const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
      const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
      let deg = (ang * 180) / Math.PI;
      let nx = -Math.sin(ang), ny = Math.cos(ang);
      if (deg > 90 || deg < -90) { deg += 180; nx = -nx; ny = -ny; }
      if (a.label) {
        const shift = a.n && si === 0 ? Math.min(40, len * 0.18) : 0;
        const mx = p0[0] + (p1[0] - p0[0]) * a.at + Math.cos(ang) * shift, my = p0[1] + (p1[1] - p0[1]) * a.at + Math.sin(ang) * shift;
        const off = -20 * a.side;
        const lx = mx + nx * off, ly = my + ny * off;
        s += `<text transform="translate(${lx.toFixed(1)} ${ly.toFixed(1)}) rotate(${deg.toFixed(1)})" font-size="${ARROW}" fill="${INK}" text-anchor="middle" stroke="#EAF0FA" stroke-width="7" paint-order="stroke" dominant-baseline="central">${esc(a.label)}</text>`;
      }
      if (a.n) {
        const d = a.label ? 26 : Math.min(46, len * 0.3);
        const bx = a.pts[0][0] + Math.cos(Math.atan2(a.pts[1][1] - a.pts[0][1], a.pts[1][0] - a.pts[0][0])) * d;
        const by = a.pts[0][1] + Math.sin(Math.atan2(a.pts[1][1] - a.pts[0][1], a.pts[1][0] - a.pts[0][0])) * d;
        s += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="18" fill="url(#aurora)"/><text x="${bx.toFixed(1)}" y="${by.toFixed(1)}" font-size="22" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#fff">${a.n}</text>`;
      }
    }
    for (const n of Object.values(this.nodes)) {
      s += `<g transform="translate(${n.x - n.size / 2} ${n.y - n.size / 2}) scale(${n.size / 100})">${icons[n.icon](n.arg)}</g>`;
      let y = n.y + n.size / 2 + 38;
      for (const l of n.L) { s += `<text x="${n.x}" y="${y}" font-size="${LABEL}" fill="${INK}" font-weight="600" text-anchor="middle">${esc(l)}</text>`; y += 34; }
      if (n.L.length) y -= 6;
      for (const l of n.S) { s += `<text x="${n.x}" y="${y}" font-size="${SUB}" fill="${INK2}" text-anchor="middle">${esc(l)}</text>`; y += 27; }
    }
    return s + "</g></svg>";
  }
}
