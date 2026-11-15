import { Canvas } from "./bbg.mjs";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });

const iconEdge = (n, side, off = 0, gap = 18) =>
  side === "r" ? [n.x + n.size / 2 + gap, n.y + off] : side === "l" ? [n.x - n.size / 2 - gap, n.y + off] : side === "t" ? [n.x + off, n.t - gap] : [n.x + off, n.y + n.size / 2 + gap];

/* ------------------------------------------------------------ 1. architecture */
function architecture() {
  const c = new Canvas(3760, 2330, "ITZA system architecture");
  // user
  const laptop = c.node("laptop", { x: 610, y: 245, icon: "laptop", size: 100, label: "Laptop" });
  const phone = c.node("phone", { x: 860, y: 245, icon: "phone", size: 100, label: "Phone (PWA)" });
  c.group({ x: 470, y: 130, w: 540, h: 270 }, "Farmer, advisor or judge", { style: "solid" });

  // browser internals
  const adapters = c.node("adapters", { x: 700, y: 760, icon: "plug", label: "Browser adapters", sub: "gaps, never errors" });
  const web = c.node("web", { x: 1090, y: 760, icon: "browser", label: "Web app", sub: "React · Map · Charts" });
  const engine = c.node("engine", { x: 650, y: 1180, icon: "gears", label: "Simulation engine", sub: "Web Worker" });
  const cache = c.node("cache", { x: 970, y: 1180, icon: "cache", label: "Offline cache", sub: "IndexedDB +\nservice worker" });
  const hero = c.node("hero", { x: 1290, y: 1180, icon: "json", label: "Hero bundles", sub: "4 demo fields" });
  const assistant = c.node("assistant", { x: 1610, y: 1180, icon: "chat", label: "Visual assistant", sub: "AI SDK + A2UI" });
  c.group({ x: 470, y: 540, w: 1400, h: 900 }, "Browser (installable PWA)", { style: "dash" });

  // outside the browser
  const globe = c.node("globe", { x: 170, y: 760, icon: "globe", label: "NASA open APIs", sub: "POWER · MODIS\nCMR · SoilGrids" });
  const tiles = c.node("tiles", { x: 1330, y: 255, icon: "edge", size: 120, label: "Basemaps", sub: "OpenFreeMap · EOx\nAWS terrain tiles" });

  // cloud run
  const itzaweb = c.node("itzaweb", { x: 2330, y: 760, icon: "server", label: "itza-web", sub: "nginx · SPA +\nhero bundles" });
  const api = c.node("api", { x: 2330, y: 1110, icon: "server", label: "itza-science-api", sub: "FastAPI · 10 routes" });
  const ml = c.node("ml", { x: 2800, y: 740, icon: "chip", size: 110, arg: "ML", label: "Stress model", sub: "LightGBM · Prithvi" });
  const store = c.node("store", { x: 2270, y: 1470, icon: "database", label: "Dataset store", sub: "GCS · SMAP + IMERG\nclips (read-only)" });
  const secrets = c.node("secrets", { x: 2720, y: 1470, icon: "lock", label: "Secret Manager", sub: "Earthdata token" });
  c.group({ x: 2070, y: 540, w: 1010, h: 1130 }, "Google Cloud Run (europe-west1)", { style: "fill" });

  // externals right
  const sat = c.node("sat", { x: 3510, y: 830, icon: "satellite", label: "NASA Earthdata", sub: "IMERG · SMAP · HLS\nGLDAS · NASADEM\nGRACE · GEDI · ECOSTRESS" });
  const usda = c.node("usda", { x: 3510, y: 1250, icon: "soil", label: "USDA SSURGO", sub: "+ POWER projections\n(NEX-GDDP)" });

  // gateway
  const gateway = c.node("gateway", { x: 1610, y: 1920, icon: "gateway", label: "itza-si-gateway", sub: "chat proxy · allow-list\n20 req/min · 60k tokens" });
  c.group({ x: 1220, y: 1560, w: 780, h: 600 }, "Cloudflare Workers (edge)", { style: "dash" });
  const llm = c.node("llm", { x: 2640, y: 1860, icon: "chip", size: 110, label: "LLM providers", sub: "Gemini → Groq (free tier)" });
  const mcp = c.node("mcp", { x: 2640, y: 2110, icon: "globe", size: 100, label: "NASA MCP servers", sub: "POWER · CMR" });

  // arrows
  c.arrow([740, 400], [740, 540 - 4], { label: "open app", n: 1 });
  c.arrow(c.P(adapters, "l", 0), c.P(globe, "r", 0), { label: "fetch NASA data", n: 2 });
  c.arrow(c.P(adapters, "r", -20, 14), c.P(web, "l", -20, 14), { label: "series + gaps" });
  c.arrow([1150, web.t - 16], [1310, tiles.b + 16], { label: "map tiles", side: -1 });
  c.arrow(c.P(web, "r", 10), c.P(itzaweb, "l", -10), { label: "load app + hero bundles", n: 3 });
  c.arrow(c.P(web, "r", 70), c.P(api, "l", -10), { label: "request bundles, zones, ML", n: 4, at: 0.55 });
  c.arrow([web.x - 70, web.b + 14], iconEdge(engine, "t", 0, 18), { label: "replay", n: 5 });
  c.arrow([web.x - 10, web.b + 14], iconEdge(cache, "t", 0, 18), {});
  c.arrow(iconEdge(hero, "t", 0, 18), [web.x + 80, web.b + 14], { label: "demo fields", side: -1 });
  c.arrow(iconEdge(assistant, "t", -30, 18), [web.x + 150, web.b + 14], { label: "ask" });
  c.arrow(c.P(api, "r", -30), [ml.x - 20, ml.b + 16], { label: "inference", side: -1 });
  c.arrow(c.P(store, "t", 0), c.P(api, "b", -60), { label: "clips" });
  c.arrow(c.P(secrets, "t", -20), c.P(api, "b", 60), { label: "tokens" });
  c.arrow(c.P(api, "r", -20, 16), c.P(sat, "l", -10, 16), { label: "earthaccess (token)", n: 0 });
  c.arrow(c.P(api, "r", 10, 16), c.P(usda, "l", -20, 16), { label: "soil, projections" });
  c.arrow(c.P(assistant, "b", 0, 16), c.P(gateway, "t", 0, 16), { label: "chat (streamed)", n: 6, at: 0.62 });
  c.arrow(c.P(gateway, "r", -30), c.P(llm, "l", 0, 16), { label: "LLM calls" });
  c.arrow(c.P(gateway, "r", 30), c.P(mcp, "l", 0, 16), { label: "NASA data tools" });
  return c;
}

/* ------------------------------------------------------------ 2. data flow */
function dataflow() {
  const c = new Canvas(3500, 2020, "ITZA data flow: from NASA and USDA sources to the engine");
  const power = c.node("power", { x: 250, y: 330, icon: "sunCloud", size: 100, label: "NASA POWER", sub: "weather, rain fallback" });
  const modis = c.node("modis", { x: 630, y: 330, icon: "leaf", size: 100, label: "ORNL MODIS", sub: "NDVI, ET, phenology" });
  const sg = c.node("sg", { x: 440, y: 570, icon: "soil", size: 100, label: "SoilGrids", sub: "global soil (fallback)" });
  c.group({ x: 60, y: 140, w: 760, h: 640 }, "NASA open APIs (no login)", { style: "dash" });

  const imerg = c.node("imerg", { x: 250, y: 1180, icon: "rainCloud", size: 100, label: "GPM IMERG", sub: "daily rain" });
  const smap = c.node("smap", { x: 630, y: 1180, icon: "drop", size: 100, label: "SMAP / LDAS", sub: "soil moisture, ET" });
  const hls = c.node("hls", { x: 250, y: 1430, icon: "satellite", size: 100, label: "HLS", sub: "30 m NDVI" });
  const dem = c.node("dem", { x: 630, y: 1430, icon: "mountain", size: 100, label: "NASADEM", sub: "elevation, slope" });
  const ssurgo = c.node("ssurgo", { x: 440, y: 1680, icon: "soil", size: 100, label: "USDA SSURGO", sub: "soil properties" });
  c.group({ x: 60, y: 1010, w: 760, h: 880 }, "NASA Earthdata + USDA (login)", { style: "dash" });

  const badapt = c.node("badapt", { x: 1340, y: 450, icon: "plug", label: "Browser adapters", sub: "no login · gaps, never errors" });
  const sapi = c.node("sapi", { x: 1340, y: 1400, icon: "server", label: "Science API adapters", sub: "Earthdata token\nGCS store first" });
  const merge = c.node("merge", { x: 2050, y: 930, icon: "merge", label: "Bundle loader", sub: "priority chains\nper-day splice, gaps kept" });
  const hero = c.node("hero", { x: 2050, y: 1650, icon: "json", label: "Hero bundles", sub: "precomputed · static" });
  const bundle = c.node("bundle", { x: 2700, y: 930, icon: "database", size: 140, label: "Field Data Bundle", sub: "13 series · soil · gaps\nprovenance on every series" });

  const cons = [
    ["fm", "calendar", "Field Memory", "NDVI → seasons, rotation"],
    ["cf", "thermometer", "Climate Fingerprint", "frost, heat, dry spells"],
    ["sr", "gears", "Season Replay", "water balance, scores"],
    ["ca", "shield", "Confidence + Arena", "SMAP check, NDVI, ML"],
    ["zt", "mountain", "Zones + 3D twin", "terrain, NDVI frames"],
    ["va", "check", "Validation", "CDL · PRISM · OpenET"],
  ].map(([id, icon, label, sub], i) => c.node(id, { x: 3250, y: 260 + i * 300, icon, size: 100, label, sub }));

  c.arrow([826, 450], c.P(badapt, "l", 0, 16), { label: "fetch", n: 1 });
  c.arrow([826, 1400], c.P(sapi, "l", 0, 16), { label: "granules", n: 2 });
  c.arrow(c.P(badapt, "r", 0, 16), c.P(merge, "t", -40, 16), { label: "series" });
  c.arrow(c.P(sapi, "r", 0, 16), c.P(merge, "b", -40, 16), { label: "series" });
  c.arrow(c.P(merge, "r", 0, 16), c.P(bundle, "l", 0, 16), { label: "merged series", n: 3 });
  c.arrow(c.P(hero, "r", -40, 16), c.P(bundle, "b", -60, 16), { label: "demo fields", dashed: true, side: -1 });
  for (const n of cons) c.arrow(c.P(bundle, "r", 0, 16), [n.l - 18, n.y], {});
  return c;
}

/* ------------------------------------------------------------ 3. engine */
function engine() {
  const c = new Canvas(3420, 1700, "ITZA simulation engine");
  const X = [850, 1240, 1630, 2020, 2410, 2800];
  const y1 = 600, y2 = 1120;
  const s1 = c.node("s1", { x: X[0], y: y1, icon: "sunCloud", label: "1. Apply scenario", sub: "rain ±30%, +4 °C, 2050" });
  const s2 = c.node("s2", { x: X[1], y: y1, icon: "sun", label: "2. Daily ET0", sub: "FAO-56 Penman-Monteith" });
  const s3 = c.node("s3", { x: X[2], y: y1, icon: "funnel", label: "3. Candidate rotations", sub: "hard filters, 2–5 seasons\ntop 6 + current" });
  const s4 = c.node("s4", { x: X[3], y: y1, icon: "calendar", label: "4. Real years", sub: "year n → crop n mod N" });
  const s5 = c.node("s5", { x: X[4], y: y1, icon: "drop", label: "5. Water balance", sub: "rain, runoff, soil water\ncrop stress" });
  const s6 = c.node("s6", { x: X[5], y: y1, icon: "thermometer", label: "6. Other processes", sub: "frost, heat, nitrogen\npests, cover, erosion" });
  const s7 = c.node("s7", { x: X[5], y: y2, icon: "barchart", label: "7. Eight criteria", sub: "each 0 to 1" });
  const s8 = c.node("s8", { x: X[4], y: y2, icon: "sliders", label: "8. Weights → score", sub: "7 sliders → weights" });
  const s9 = c.node("s9", { x: X[3], y: y2, icon: "dice", label: "9. Monte Carlo", sub: "200 seeded draws" });
  const s10 = c.node("s10", { x: X[2], y: y2, icon: "podium", label: "10. Resilience", sub: "median, P10/P90\nwin rate" });
  const s11 = c.node("s11", { x: X[1], y: y2, icon: "shield", label: "11. Confidence", sub: "5 factors + evidence\ncards" });
  const out = c.node("out", { x: X[0], y: y2, icon: "browser", label: "Ranked rotations", sub: "labelled counterfactual,\nnot measured yield" });
  c.group({ x: 620, y: 150, w: 2740, h: 1500 }, "Season Replay (Web Worker, seeded and repeatable)", { style: "dash" });

  const soil = c.node("soil", { x: X[4], y: 255, icon: "soil", size: 80, label: "Soil + slope", sub: "SSURGO / SoilGrids, NASADEM" });
  const sat = c.node("sat", { x: X[1], y: 1480, icon: "satellite", size: 80, label: "SMAP only checks", sub: "never changes the scores" });

  const farmer = c.node("farmer", { x: 190, y: 420, icon: "sliders", label: "Farmer input", sub: "rotations, sliders\nconstraints" });
  const fb = c.node("fb", { x: 190, y: 800, icon: "json", label: "Field bundle", sub: "weather, soil, slope" });
  const kp = c.node("kp", { x: 190, y: 1180, icon: "book", label: "Knowledge pack", sub: "crop rules, calendars" });
  for (const [n, y, l] of [[farmer, 420, "choices"], [fb, 800, "field data"], [kp, 1180, "crop rules"]]) c.arrow([n.r + 16, y], [616, y], { label: l });

  const row = [s1, s2, s3, s4, s5, s6];
  for (let i = 0; i < 5; i++) c.arrow(iconEdge(row[i], "r"), iconEdge(row[i + 1], "l"), {});
  c.arrow([X[5], s6.b + 16], iconEdge(s7, "t"), {});
  const row2 = [s7, s8, s9, s10, s11, out];
  for (let i = 0; i < 5; i++) c.arrow(iconEdge(row2[i], "l"), iconEdge(row2[i + 1], "r"), {});
  c.arrow([soil.x, soil.b + 16], iconEdge(s5, "t"), { dashed: true, color: "green" });
  c.arrow(iconEdge(sat, "t", 0, 16), [X[1], s11.b + 16], { dashed: true, color: "green" });
  return c;
}

/* ------------------------------------------------------------ 4. build + deploy */
function deploy() {
  const c = new Canvas(3700, 1660, "ITZA build, data pipelines and deployment");
  const pipes = c.node("pipes", { x: 290, y: 430, icon: "terminal", label: "Pipelines", sub: "Python · uv\ndev machines" });
  const repo = c.node("repo", { x: 1000, y: 430, icon: "branch", label: "Monorepo", sub: "GitHub ITZA-SPACE/itza" });
  const ci = c.node("ci", { x: 1790, y: 290, icon: "play", label: "CI (ci.yml)", sub: "lint · types · tests" });
  const rel = c.node("rel", { x: 1790, y: 680, icon: "play", label: "Release (release.yml)", sub: "push to main" });
  c.group(c.around([repo, ci, rel], 60, 80), "GitHub", { style: "dash" });
  const ar = c.node("ar", { x: 2530, y: 680, icon: "cube", label: "Artifact Registry", sub: "repository itza" });
  const run = c.node("run", { x: 3180, y: 680, icon: "server", label: "Cloud Run", sub: "itza-science-api\nitza-web" });
  const lock = c.node("lock", { x: 3390, y: 1130, icon: "lock", label: "Secret Manager", sub: "Earthdata, OpenET keys" });
  c.group({ x: 2250, y: 400, w: 1330, h: 960 }, "Google Cloud (europe-west1)", { style: "dash" });
  const gcs = c.node("gcs", { x: 290, y: 1110, icon: "database", label: "Dataset store (GCS)", sub: "SMAP + IMERG clips" });
  const wr = c.node("wr", { x: 1000, y: 1110, icon: "terminal", label: "Gateway deploy", sub: "pnpm deploy (manual)" });
  const cf = c.node("cf", { x: 1790, y: 1110, icon: "edge", label: "Cloudflare Worker", sub: "itza-si-gateway" });
  c.group(c.around([cf], 70, 80), "Cloudflare", { style: "dash" });

  c.arrow(iconEdge(pipes, "r", 0, 18), iconEdge(repo, "l", 0, 18), { label: "commit outputs", n: 1 });
  c.arrow(c.P(pipes, "b", 0, 16), c.P(gcs, "t", 0, 16), { label: "sync clips", n: 2 });
  c.arrow(c.P(repo, "r", -20, 16), c.P(ci, "l", 20, 16), { label: "push / PR" });
  c.arrow(c.P(repo, "r", 20, 16), c.P(rel, "l", -20, 16), { label: "push to main", n: 3 });
  c.arrow(iconEdge(rel, "r", 0, 18), c.P(ar, "l", 0, 16), { label: "build images", n: 4 });
  c.arrow(c.P(ar, "r", 0, 16), c.P(run, "l", 0, 16), { label: "deploy", n: 5 });
  c.arrow(c.P(repo, "b", 0, 16), c.P(wr, "t", 0, 16), { label: "gateway change" });
  c.arrow(c.P(wr, "r", 0, 16), c.P(cf, "l", 0, 16), { label: "wrangler deploy" });
  c.arrow(c.P(gcs, "b", 0, 16), [3060, run.b + 16], { label: "read-only mount at /data/store", via: [[290, 1540], [3060, 1540]], seg: 1 });
  c.arrow(c.P(lock, "l", -20, 16), [3330, run.b + 30], { label: "tokens" });
  return c;
}

const all = { "1-architecture": architecture(), "2-data-flow": dataflow(), "3-simulation-engine": engine(), "4-build-and-deploy": deploy() };
for (const [name, c] of Object.entries(all)) writeFileSync(`${OUT}/${name}.svg`, c.svg());
console.log("ok", Object.keys(all).join(", "));
