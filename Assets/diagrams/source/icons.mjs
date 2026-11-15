// Flat icon set in the ByteByteGo style. Every icon is drawn in a 100x100 box.
export const C = {
  K: "#F5F5FA", G: "#7fba42", B: "#4C93FF", BL: "#80d4f9", CY: "#39b4e0", GR: "#B4B4C8",
  P: "#8B6BFF", A: "#2F7BFF", W: "#0B1226", O: "#ffb703", R: "#e03131", BR: "#8d6e4b",
};

const gear = (cx, cy, ro, ri, teeth, fill, hole = true) => {
  const pts = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    for (const [da, r] of [[-0.32, ri], [-0.2, ro], [0.2, ro], [0.32, ri]]) {
      const ang = a + da * step * 1.5;
      pts.push(`${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`);
    }
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}"/>` + (hole ? `<circle cx="${cx}" cy="${cy}" r="${ri * 0.42}" fill="#0B1226"/>` : "");
};

const cyl = (x, y, w, h, fill = C.B, ry = 7) => {
  const rx = w / 2, cx = x + rx;
  return `<path d="M${x},${y + ry} v${h - 2 * ry} a${rx},${ry} 0 0 0 ${w},0 v${-(h - 2 * ry)} z" fill="${fill}"/>` +
    `<ellipse cx="${cx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"/>` +
    `<ellipse cx="${cx}" cy="${y + ry}" rx="${rx * 0.7}" ry="${ry * 0.55}" fill="#0B1226"/>`;
};

const cloud = (fill) =>
  `<g fill="${fill}"><circle cx="34" cy="58" r="20"/><circle cx="56" cy="46" r="26"/><circle cx="78" cy="60" r="18"/><rect x="34" y="58" width="44" height="20" rx="2"/><rect x="14" y="58" width="82" height="20" rx="10"/></g>`;

const drop = (x, y, fill = C.B) => `<path d="M${x},${y - 10} C${x + 8},${y} ${x + 8},${y + 8} ${x},${y + 8} C${x - 8},${y + 8} ${x - 8},${y} ${x},${y - 10} Z" fill="${fill}"/>`;

const rackServer = (fill = C.G) => {
  const slot = (x, y, w = 16) => `<rect x="${x}" y="${y}" width="${w}" height="3.5" rx="1.7" fill="#0B1226"/>`;
  return `<rect x="19" y="8" width="29" height="30" rx="4" fill="${fill}"/><rect x="52" y="8" width="29" height="30" rx="4" fill="${fill}"/>` +
    slot(25.5, 17) + slot(58.5, 17) +
    [4, 35, 66].map((x) => `<rect x="${x}" y="28" width="30" height="62" rx="4" fill="${fill}" stroke="#0B1226" stroke-width="2.5"/>${slot(x + 7, 40)}${slot(x + 7, 72)}${slot(x + 7, 79)}`).join("");
};

export const icons = {
  laptop: () => `<rect x="18" y="14" width="64" height="46" rx="5" fill="#0B1226" stroke="${C.K}" stroke-width="5"/><rect x="5" y="64" width="90" height="10" rx="5" fill="${C.K}"/><rect x="40" y="67" width="20" height="3.2" rx="1.6" fill="#0B1226"/>`,
  phone: () => `<rect x="32" y="8" width="36" height="78" rx="7" fill="#0B1226" stroke="${C.K}" stroke-width="5"/><rect x="42" y="15" width="16" height="3" rx="1.5" fill="${C.K}"/><circle cx="50" cy="77" r="3" fill="${C.K}"/>`,
  person: () => `<circle cx="50" cy="30" r="15" fill="#0B1226" stroke="${C.K}" stroke-width="5"/><path d="M18 88 C18 60 34 52 50 52 C66 52 82 60 82 88 Z" fill="#0B1226" stroke="${C.K}" stroke-width="5" stroke-linejoin="round"/>`,
  browser: () => `<rect x="8" y="16" width="84" height="68" rx="7" fill="#0B1226" stroke="${C.K}" stroke-width="5"/><line x1="8" y1="36" x2="92" y2="36" stroke="${C.K}" stroke-width="4"/>${[20, 31, 42].map((x) => `<circle cx="${x}" cy="26" r="2.8" fill="${C.K}"/>`).join("")}<rect x="20" y="46" width="28" height="28" rx="3" fill="${C.B}"/><rect x="56" y="48" width="26" height="5" rx="2.5" fill="${C.G}"/><rect x="56" y="59" width="26" height="5" rx="2.5" fill="${C.B}"/><rect x="56" y="70" width="18" height="5" rx="2.5" fill="${C.BL}"/>`,
  server: () => rackServer(),
  serverBlue: () => rackServer(C.B),
  database: () => cyl(8, 8, 36, 46) + cyl(32, 26, 36, 46) + cyl(56, 44, 36, 46),
  json: () => cyl(22, 10, 56, 80, C.B, 9) + `<text x="50" y="66" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="30" fill="#0B1226">{ }</text>`,
  cache: () => [[6, 8], [24, 34], [42, 60]].map(([x, y]) => `<rect x="${x}" y="${y + 3}" width="54" height="26" rx="5" fill="#3B7BD6"/><rect x="${x}" y="${y}" width="54" height="26" rx="5" fill="${C.B}"/><text x="${x + 27}" y="${y + 18}" text-anchor="middle" font-family="Arial Narrow, Arial" font-weight="bold" font-size="14" fill="#0B1226">CACHE</text>`).join(""),
  gateway: () => `<path d="M24 14 H76 L92 86 H8 Z" fill="${C.B}"/><circle cx="50" cy="28" r="4.5" fill="#0B1226"/><line x1="50" y1="32" x2="50" y2="68" stroke="#0B1226" stroke-width="4.5"/><polygon points="43,64 57,64 50,76" fill="#0B1226"/><path d="M50 46 L30 64" stroke="#0B1226" stroke-width="4.5" fill="none"/><polygon points="22,60 36,58 28,72" fill="#0B1226"/><path d="M50 46 L70 64" stroke="#0B1226" stroke-width="4.5" fill="none"/><polygon points="78,60 64,58 72,72" fill="#0B1226"/>`,
  edge: () => `${cloud(C.BL)}<polygon points="58,8 40,44 54,44 46,72 74,32 58,32 68,8" fill="#0B1226"/>`,
  globe: () => `<circle cx="50" cy="50" r="40" fill="#0B1226" stroke="${C.GR}" stroke-width="7"/><ellipse cx="50" cy="50" rx="17" ry="40" fill="none" stroke="${C.GR}" stroke-width="5"/><line x1="10" y1="50" x2="90" y2="50" stroke="${C.GR}" stroke-width="5"/><path d="M15 30 Q50 40 85 30" fill="none" stroke="${C.GR}" stroke-width="5"/><path d="M15 70 Q50 60 85 70" fill="none" stroke="${C.GR}" stroke-width="5"/>`,
  satellite: () => `<g transform="rotate(-40 50 50)"><line x1="34" y1="50" x2="40" y2="50" stroke="#B4B4C8" stroke-width="4"/><line x1="60" y1="50" x2="66" y2="50" stroke="#B4B4C8" stroke-width="4"/><rect x="4" y="38" width="30" height="24" rx="2" fill="${C.B}"/><rect x="66" y="38" width="30" height="24" rx="2" fill="${C.B}"/><g stroke="#0B1226" stroke-width="2"><line x1="14" y1="38" x2="14" y2="62"/><line x1="24" y1="38" x2="24" y2="62"/><line x1="4" y1="50" x2="34" y2="50"/><line x1="76" y1="38" x2="76" y2="62"/><line x1="86" y1="38" x2="86" y2="62"/><line x1="66" y1="50" x2="96" y2="50"/></g><rect x="40" y="34" width="20" height="32" rx="4" fill="#B4B4C8"/><circle cx="50" cy="50" r="5" fill="${C.BL}"/><line x1="50" y1="34" x2="50" y2="22" stroke="#B4B4C8" stroke-width="4"/><path d="M40 16 Q50 30 60 16 Z" fill="#B4B4C8"/></g>`,
  chip: (t = "LLM") => `${[34, 46, 58, 70].map((p) => `<line x1="${p}" y1="10" x2="${p}" y2="24" stroke="${C.B}" stroke-width="4.5"/><line x1="${p}" y1="76" x2="${p}" y2="90" stroke="${C.B}" stroke-width="4.5"/><line x1="10" y1="${p + 0}" x2="24" y2="${p}" stroke="${C.B}" stroke-width="4.5"/><line x1="76" y1="${p}" x2="90" y2="${p}" stroke="${C.B}" stroke-width="4.5"/>`).join("")}<rect x="22" y="22" width="56" height="56" rx="9" fill="${C.B}"/><text x="50" y="58" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="21" fill="#0B1226">${t}</text>`,
  lock: () => `<path d="M33 46 V34 a17 17 0 0 1 34 0 V46" fill="none" stroke="${C.P}" stroke-width="9"/><rect x="22" y="44" width="56" height="44" rx="7" fill="${C.P}"/><circle cx="50" cy="63" r="6.5" fill="#0B1226"/><rect x="47" y="66" width="6" height="13" rx="2" fill="#0B1226"/>`,
  branch: () => `<g fill="#0B1226" stroke="${C.K}" stroke-width="5"><line x1="30" y1="28" x2="30" y2="72"/><path d="M30 66 C30 48 70 58 70 46" fill="none"/><circle cx="30" cy="20" r="10"/><circle cx="30" cy="80" r="10"/><circle cx="70" cy="38" r="10"/></g>`,
  play: () => `<circle cx="50" cy="50" r="40" fill="${C.G}"/><polygon points="40,30 40,70 73,50" fill="#0B1226"/>`,
  cube: () => `<polygon points="50,8 88,29 88,71 50,92 12,71 12,29" fill="#0B1226" stroke="${C.K}" stroke-width="5" stroke-linejoin="round"/><polygon points="50,8 88,29 50,50 12,29" fill="#dee2e6" stroke="${C.K}" stroke-width="5" stroke-linejoin="round"/><line x1="50" y1="50" x2="50" y2="92" stroke="${C.K}" stroke-width="5"/>`,
  terminal: () => `<rect x="8" y="16" width="84" height="68" rx="9" fill="#0B1226" stroke="${C.K}" stroke-width="5"/><text x="22" y="62" font-family="Courier New, monospace" font-weight="bold" font-size="34" fill="${C.K}">&gt;_</text>`,
  sliders: () => `<g stroke="${C.K}" stroke-width="5" stroke-linecap="round"><line x1="12" y1="28" x2="88" y2="28"/><line x1="12" y1="50" x2="88" y2="50"/><line x1="12" y1="72" x2="88" y2="72"/></g><g fill="#0B1226" stroke="${C.K}" stroke-width="5"><circle cx="34" cy="28" r="9"/><circle cx="66" cy="50" r="9"/><circle cx="44" cy="72" r="9"/></g>`,
  gears: () => gear(40, 56, 36, 28, 8, C.B) + gear(76, 26, 21, 16, 8, "#6aa0d8"),
  chat: () => `<path d="M12 14 H88 a8 8 0 0 1 8 8 V60 a8 8 0 0 1 -8 8 H46 L26 88 V68 H12 a8 8 0 0 1 -8 -8 V22 a8 8 0 0 1 8 -8 Z" fill="${C.B}"/>${[30, 50, 70].map((x) => `<circle cx="${x}" cy="41" r="5.5" fill="#0B1226"/>`).join("")}`,
  plug: () => `<rect x="30" y="34" width="40" height="32" rx="7" fill="#0B1226" stroke="${C.K}" stroke-width="5"/><rect x="39" y="14" width="7" height="20" fill="${C.K}"/><rect x="54" y="14" width="7" height="20" fill="${C.K}"/><path d="M50 66 V76 C50 88 28 82 20 90" fill="none" stroke="${C.K}" stroke-width="5" stroke-linecap="round"/>`,
  book: () => `<path d="M50 22 C38 14 22 14 10 18 V78 C22 74 38 74 50 82 C62 74 78 74 90 78 V18 C78 14 62 14 50 22 Z" fill="#0B1226" stroke="${C.K}" stroke-width="5" stroke-linejoin="round"/><line x1="50" y1="22" x2="50" y2="82" stroke="${C.K}" stroke-width="4"/><path d="M24 36 q10 -3 18 2 M24 48 q10 -3 18 2" fill="none" stroke="${C.G}" stroke-width="4" stroke-linecap="round"/>`,
  document: () => `<path d="M22 8 H62 L80 26 V92 H22 Z" fill="#0B1226" stroke="${C.K}" stroke-width="5" stroke-linejoin="round"/><path d="M62 8 V26 H80" fill="none" stroke="${C.K}" stroke-width="5" stroke-linejoin="round"/><g stroke-width="5" stroke-linecap="round"><line x1="33" y1="44" x2="68" y2="44" stroke="${C.B}"/><line x1="33" y1="58" x2="68" y2="58" stroke="${C.B}"/><line x1="33" y1="72" x2="55" y2="72" stroke="${C.G}"/></g>`,
  funnel: () => `<polygon points="8,16 92,16 58,54 58,86 42,78 42,54" fill="${C.B}" stroke="${C.B}" stroke-width="4" stroke-linejoin="round"/><line x1="22" y1="28" x2="78" y2="28" stroke="#0B1226" stroke-width="4"/>`,
  calendar: () => `<rect x="10" y="18" width="80" height="72" rx="9" fill="#0B1226" stroke="${C.K}" stroke-width="5"/><path d="M10 27 a9 9 0 0 1 9 -9 H81 a9 9 0 0 1 9 9 V40 H10 Z" fill="${C.B}"/><line x1="32" y1="8" x2="32" y2="28" stroke="${C.K}" stroke-width="6" stroke-linecap="round"/><line x1="68" y1="8" x2="68" y2="28" stroke="${C.K}" stroke-width="6" stroke-linecap="round"/>${[24, 44, 64].map((x) => [52, 68, 80].slice(0, 2).map((y) => `<rect x="${x}" y="${y}" width="10" height="9" rx="2" fill="${C.G}"/>`).join("")).join("")}`,
  barchart: () => `<line x1="8" y1="88" x2="92" y2="88" stroke="${C.K}" stroke-width="5" stroke-linecap="round"/><rect x="14" y="54" width="16" height="30" rx="2" fill="${C.B}"/><rect x="38" y="34" width="16" height="50" rx="2" fill="${C.G}"/><rect x="62" y="14" width="16" height="70" rx="2" fill="${C.B}"/>`,
  thermometer: () => `<rect x="42" y="8" width="16" height="62" rx="8" fill="#0B1226" stroke="${C.K}" stroke-width="5"/><rect x="47" y="34" width="6" height="36" fill="${C.R}"/><circle cx="50" cy="76" r="15" fill="${C.R}" stroke="${C.K}" stroke-width="5"/>`,
  dice: () => `<rect x="14" y="14" width="72" height="72" rx="12" fill="#0B1226" stroke="${C.K}" stroke-width="5"/>${[[34, 34], [66, 34], [50, 50], [34, 66], [66, 66]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${C.K}"/>`).join("")}`,
  podium: () => `<rect x="8" y="52" width="28" height="36" fill="#6aa0d8"/><rect x="36" y="34" width="28" height="54" fill="${C.B}"/><rect x="64" y="62" width="28" height="26" fill="#6aa0d8"/><polygon points="50,6 55,18 68,19 58,28 61,40 50,33 39,40 42,28 32,19 45,18" fill="${C.O}"/>`,
  sun: () => `<circle cx="50" cy="50" r="19" fill="${C.O}"/>${Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<line x1="${50 + 28 * Math.cos(a)}" y1="${50 + 28 * Math.sin(a)}" x2="${50 + 40 * Math.cos(a)}" y2="${50 + 40 * Math.sin(a)}" stroke="${C.O}" stroke-width="6" stroke-linecap="round"/>`; }).join("")}`,
  sunCloud: () => `<circle cx="34" cy="34" r="16" fill="${C.O}"/>${Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<line x1="${34 + 22 * Math.cos(a)}" y1="${34 + 22 * Math.sin(a)}" x2="${34 + 31 * Math.cos(a)}" y2="${34 + 31 * Math.sin(a)}" stroke="${C.O}" stroke-width="5" stroke-linecap="round"/>`; }).join("")}<g transform="translate(8 12)">${cloud(C.BL)}</g>`,
  rainCloud: () => `<g transform="translate(0 -8)">${cloud(C.BL)}</g>${drop(30, 80)}${drop(50, 88)}${drop(70, 80)}`,
  drop: () => `<path d="M50 6 C72 34 82 48 82 62 C82 80 68 94 50 94 C32 94 18 80 18 62 C18 48 28 34 50 6 Z" fill="${C.B}"/><path d="M34 64 C34 72 40 80 48 82" fill="none" stroke="#0B1226" stroke-width="5" stroke-linecap="round"/>`,
  leaf: () => `<path d="M16 84 C14 40 46 12 88 12 C88 54 64 90 20 86 Z" fill="${C.G}"/><path d="M18 84 C36 62 56 40 80 20" fill="none" stroke="#0B1226" stroke-width="4" stroke-linecap="round"/><path d="M42 62 L40 46 M58 48 L66 62" fill="none" stroke="#0B1226" stroke-width="3.5" stroke-linecap="round"/>`,
  mountain: () => `<polygon points="4,86 38,24 72,86" fill="#7a8b99"/><polygon points="44,86 68,42 96,86" fill="#9aaab6"/><polygon points="38,24 29,40 38,35 47,41" fill="#0B1226"/><polygon points="68,42 61,54 68,50 75,55" fill="#0B1226"/>`,
  soil: () => `<defs><clipPath id="soilclip"><rect x="8" y="14" width="84" height="76" rx="12"/></clipPath></defs><g clip-path="url(#soilclip)"><rect x="8" y="14" width="84" height="22" fill="#6b9e3c"/><rect x="8" y="36" width="84" height="20" fill="#8d6e4b"/><rect x="8" y="56" width="84" height="18" fill="#a8845c"/><rect x="8" y="74" width="84" height="18" fill="#5c4630"/></g>`,
  shield: () => `<path d="M50 8 L86 22 V50 C86 72 70 86 50 94 C30 86 14 72 14 50 V22 Z" fill="${C.B}"/><path d="M32 50 L45 63 L69 37" fill="none" stroke="#0B1226" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  merge: () => `<path d="M12 18 H88 L68 82 H32 Z" fill="${C.B}"/><g stroke="#0B1226" stroke-width="5" fill="none" stroke-linecap="round"><path d="M28 34 L50 52"/><path d="M72 34 L50 52"/><path d="M50 34 L50 52"/><line x1="50" y1="52" x2="50" y2="68"/></g><polygon points="43,64 57,64 50,75" fill="#0B1226"/>`,
  check: () => `<circle cx="50" cy="50" r="40" fill="${C.G}"/><path d="M28 52 L44 68 L74 34" fill="none" stroke="#0B1226" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
};
