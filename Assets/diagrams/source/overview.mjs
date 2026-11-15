import { Lanes, COL } from "./lanes.mjs";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const I = (name, arg) => ({ icon: { name, arg } });

/* ---------------------------------------------------------------- system overview */
function overview() {
  const c = new Lanes(2400, 1540, "ITZA: System Overview", "Abstracted view of the built system. Detailed views: data flow, simulation engine, Google Cloud deployment.");

  // lanes
  c.lane(40, 30, 250, 720, "Users", "mobile first", COL.grey);
  c.lane(330, 30, 690, 720, "Browser", "installable PWA · the engine runs here", COL.rain);
  c.lane(1100, 30, 610, 720, "Google Cloud", "europe-west1 · Cloud Run, Storage, Secrets", COL.gcp);
  c.lane(1790, 30, 570, 720, "External services", "NASA and USDA data, basemaps", COL.green);
  c.lane(330, 800, 2030, 250, "Edge, AI and open APIs", "outside Google Cloud", COL.amber, 1130);

  // users
  c.card(60, 130, 210, 95, COL.grey, "Farmer or advisor", ["draws a field,", "compares rotations"]);
  c.card(60, 255, 210, 110, COL.grey, "Judge", ["guided demo", "no login, offline"]);
  c.art("laptop", 60, 400, 100); c.art("phone", 170, 395, 100);
  c.card(60, 560, 210, 110, COL.grey, "Any device", ["phone, tablet, laptop", "installable, offline"]);

  // browser
  c.card(350, 130, 650, 95, COL.rain, "Web app", ["React 19 · TanStack Router and Query · Zustand · Tailwind", "Field, Past, Plan, Future, Decide, Ask ITZA, Sources"]);
  c.card(350, 255, 310, 110, COL.rain, "Simulation engine", ["Web Worker · seeded", "FAO-56 ET0 · water balance", "200 Monte Carlo draws"], I("gears"));
  c.card(690, 255, 310, 110, COL.rain, "Hero bundles", ["4 precomputed demo fields", "static files, work offline"], I("json"));
  c.card(350, 415, 310, 110, COL.rain, "Offline cache", ["IndexedDB + service worker", "installable PWA"], I("cache"));
  c.card(690, 415, 310, 110, COL.rain, "Map and 3D twin", ["MapLibre · deck.gl", "terrain, relief, zones"], I("mountain"));
  c.card(350, 555, 310, 110, COL.rain, "Browser adapters", ["POWER · MODIS · CMR", "no login, gaps never errors"], I("plug"));
  c.card(690, 555, 310, 110, COL.violet, "Visual assistant", ["Vercel AI SDK + A2UI", "fixed answer catalog"], I("chat"));
  c.arrow([[505, 225], [505, 255]]);
  c.arrow([[845, 255], [845, 225]]);

  // google cloud
  c.card(1120, 130, 250, 110, COL.gcp, "Cloud Run", ["itza-web", "nginx · scales to zero"], { gcpIcon: "cloudrun" });
  c.card(1390, 130, 300, 110, COL.gcp, "Secret Manager", ["Earthdata token", "OpenET key"], { gcpIcon: "secret" });
  c.card(1120, 290, 570, 150, COL.gcp, "Cloud Run: itza-science-api", ["FastAPI · 1 GiB · CPU always on · 1 instance", "bundles · zones · terrain · frames · NISAR context", "projections · boundaries · stress-model inference"], { gcpIcon: "cloudrun" });
  c.card(1120, 500, 250, 110, COL.gcp, "Cloud Storage", ["dataset store", "SMAP + IMERG clips"], { gcpIcon: "storage" });
  c.card(1390, 500, 300, 110, COL.gcp, "Runtime identity", ["itza-run account", "least privilege"], { gcpIcon: "iam" });
  c.card(1120, 640, 570, 90, COL.gcp, "Artifact Registry", ["images built by GitHub Actions on push to main", "Workload Identity Federation, no key files"], { gcpIcon: "registry" });
  c.arrow([[1540, 240], [1540, 290]], { color: COL.gcp });
  c.arrow([[1245, 500], [1245, 440]], { color: COL.gcp });
  c.arrow([[1540, 500], [1540, 440]], { color: COL.gcp, dashed: true });

  // external
  c.card(1810, 130, 530, 130, COL.green, "NASA Earthdata", ["IMERG · SMAP · HLS · GLDAS · NASADEM", "GRACE · GEDI · ECOSTRESS (login)"], I("satellite"));
  c.card(1810, 290, 530, 110, COL.green, "USDA SSURGO", ["soil properties", "+ POWER projections (NEX-GDDP)"], I("soil"));
  c.card(1810, 415, 530, 110, COL.green, "Basemaps and terrain", ["OpenFreeMap · EOx imagery", "AWS terrain tiles"], I("globe"));

  // lower band
  c.card(350, 880, 310, 130, COL.green, "NASA open APIs", ["POWER · ORNL MODIS", "CMR · SoilGrids fallback"], I("sunCloud"));
  c.card(690, 880, 310, 130, COL.amber, "SI gateway", ["Cloudflare Worker", "origin allow-list · 20 req/min", "60k tokens per session"], I("gateway"));
  c.card(1120, 880, 310, 130, COL.violet, "LLM providers", ["Gemini 3.1 Flash-Lite", "fallback: Groq gpt-oss-120b"], I("chip"));
  c.card(1460, 880, 310, 130, COL.green, "NASA MCP servers", ["POWER · CMR", "no key required"], I("globe"));
  c.card(1800, 870, 540, 150, COL.grey, "Legend", ["cyan: runs in the browser · blue: Google Cloud", "amber: Cloudflare edge · green: external data", "violet: language models · hexagons: GCP services"]);

  // cross-lane arrows
  c.arrow([[1020, 180], [1100, 180], [1120, 180]], { label: ["load app", "+ bundles"], labelAt: [1060, 180] });
  c.arrow([[1000, 210], [1060, 210], [1060, 335], [1120, 335]], { label: ["bundles,", "zones, ML"], labelAt: [1060, 272] });
  c.arrow([[1000, 470], [1810, 470]], { label: "map tiles", labelAt: [1405, 470] });
  c.arrow([[1690, 330], [1750, 330], [1750, 195], [1810, 195]], { label: ["Earthdata", "token"], labelAt: [1750, 262] });
  c.arrow([[1690, 380], [1810, 380]], { label: "soil", labelAt: [1750, 380] });
  c.arrow([[505, 665], [505, 880]], { label: ["fetch", "(CORS)"], labelAt: [505, 775] });
  c.arrow([[845, 665], [845, 880]], { color: COL.violet, label: ["chat", "(streamed)"], labelAt: [845, 775] });
  c.arrow([[1000, 945], [1120, 945]], { color: COL.violet, label: "LLM calls", labelAt: [1060, 945] });
  c.arrow([[845, 1010], [845, 1032], [1615, 1032], [1615, 1010]], { color: COL.green, label: "NASA data tools", labelAt: [1230, 1032] });
  c.arrow([[290, 177], [350, 177]]);
  c.arrow([[290, 310], [310, 310], [310, 177]], { head: false });

  c.panel(40, 1090, 2320, 190, "Design principles", [
    ["Browser-first engine", "The simulation runs in a Web Worker, so sliders", "re-rank instantly and the demo works offline."],
    ["Precompute heavy, fetch light", "Earthdata rasters are clipped in Python; POWER, MODIS", "and CMR are called straight from the browser."],
    ["Provenance is data", "Source, version, resolution and quality travel with", "every value. Gaps stay gaps, never silent fills."],
    ["Grounded assistant", "The model routes and phrases; tools compute.", "No tool, no number. Answers use a fixed UI catalog."],
  ]);
  c.panel(40, 1310, 2320, 190, "Where each part runs", [
    ["Browser", "Web app, engine, adapters, offline cache.", "Free for us, works offline for the demo fields."],
    ["Google Cloud Run", "itza-web scales to zero; itza-science-api stays", "warm with one instance. Dataset store on Cloud Storage."],
    ["Cloudflare Workers", "SI gateway on the free plan keeps model keys off", "the client and caps each session's requests and tokens."],
    ["GitHub Actions + NVIDIA Brev", "Actions builds and deploys on push to main.", "Brev runs batch GPU jobs and never serves traffic."],
  ]);
  return c;
}

/* ---------------------------------------------------------------- google cloud deployment */
function gcpDeploy() {
  const c = new Lanes(2400, 1560, "ITZA on Google Cloud", "How code reaches Cloud Run, and how the services use storage, secrets and identity.");

  c.lane(40, 30, 360, 730, "Source and CI", "GitHub · ITZA-SPACE/itza", COL.grey);
  c.lane(450, 30, 350, 730, "Trust and identity", "no key files anywhere", COL.violet);
  c.lane(850, 30, 850, 730, "Google Cloud project", "europe-west1 · one shared project", COL.gcp);
  c.lane(1750, 30, 610, 730, "Clients and services", "outside the project", COL.green);
  c.lane(40, 820, 2320, 250, "Data pipelines and batch compute", "outside CI: run by the team on demand", COL.amber);

  // source and ci
  c.card(60, 130, 300, 110, COL.grey, "ci.yml", ["lint · types · tests", "web, engine, API, gateway"], I("play"));
  c.card(60, 300, 300, 110, COL.grey, "Monorepo", ["pnpm + Turborepo · uv", "branches: main and dev"], I("branch"));
  c.card(60, 470, 300, 110, COL.grey, "release.yml", ["on every push to main", "build, push, deploy"], I("play"));
  c.arrow([[220, 300], [220, 240]], { label: "PR + push", labelAt: [220, 270] });
  c.arrow([[220, 410], [220, 470]], { label: "push to main", labelAt: [220, 440] });

  // trust
  c.card(490, 290, 290, 140, COL.violet, "itza-deployer", ["service account", "run.admin on itza-* only", "registry writer on itza", "actAs itza-run"], { gcpIcon: "iam", titleSize: 20 });
  c.card(490, 465, 290, 130, COL.violet, "Workload Identity", ["Federation · pool github-itza", "only for ITZA-SPACE/itza", "swaps the GitHub OIDC token"], { gcpIcon: "wif", titleSize: 20 });
  c.arrow([[360, 530], [490, 530]], { color: COL.violet, label: ["OIDC", "token"], labelAt: [425, 530] });
  c.card(490, 130, 290, 120, COL.violet, "itza-run", ["runtime service account", "secretAccessor on its secrets"], { gcpIcon: "iam", titleSize: 20 });
  c.arrow([[635, 465], [635, 430]], { color: COL.violet, label: "impersonates", labelAt: [635, 447] });

  // google cloud
  c.card(870, 290, 250, 140, COL.gcp, "Artifact Registry", ["repository itza", "science-api + web images", "tags: SHA + latest"], { gcpIcon: "registry" });
  c.card(1220, 130, 460, 120, COL.gcp, "Cloud Run: itza-web", ["nginx on :8080 · public", "0 to 3 instances, scales to zero"], { gcpIcon: "cloudrun" });
  c.card(1220, 290, 460, 430, COL.gcp, "Cloud Run: itza-science-api", [
    "FastAPI on :8000 · public · gen2", "1 GiB · CPU always on · 1 instance", "runs as the itza-run service account", "",
    "ITZA_ENVIRONMENT=production", "ITZA_CORS_ORIGINS = the web origin", "ITZA_DATASET_STORE_DIR=/data/store", "scratch space in /tmp/itza", "",
    "/v1/bundles · /v1/zones · /v1/projection", "/v1/boundaries · /stress · NISAR, GRACE, GEDI", "terrain, frames and soil per bundle"], { gcpIcon: "cloudrun" });
  c.card(870, 470, 250, 100, COL.gcp, "Secret Manager", ["earthdata-token", "openet-api-key"], { gcpIcon: "secret" });
  c.card(870, 610, 250, 110, COL.gcp, "Cloud Storage", ["<project>-itza-data", "versioned, never public"], { gcpIcon: "storage" });
  c.arrow([[780, 330], [870, 330]], { color: COL.violet, label: ["push", "images"], labelAt: [825, 330] });
  c.arrow([[1120, 310], [1170, 310], [1170, 190], [1220, 190]], { color: COL.gcp });
  c.arrow([[1120, 400], [1220, 400]], { color: COL.gcp, label: "deploy", labelAt: [1170, 355] });
  c.arrow([[1120, 520], [1220, 520]], { color: COL.gcp, label: "env vars", labelAt: [1170, 520] });
  c.arrow([[1120, 665], [1220, 665]], { color: COL.gcp, label: "read-only", labelAt: [1170, 665] });

  // clients and services
  c.card(1780, 130, 550, 100, COL.rain, "Browser", ["installable PWA: loads the app, calls the API"], I("browser"));
  c.card(1780, 270, 550, 100, COL.amber, "SI gateway", ["Cloudflare Worker · allow-list · rate limits"], I("gateway"));
  c.card(1780, 410, 550, 90, COL.violet, "LLM providers", ["Gemini 3.1 Flash-Lite, then Groq"], I("chip"));
  c.card(1780, 560, 550, 130, COL.green, "NASA Earthdata", ["IMERG · SMAP · HLS · GLDAS", "NASADEM · GRACE · GEDI"], I("satellite"));
  c.arrow([[1680, 190], [1780, 190]], { label: ["load app"], labelAt: [1730, 190] });
  c.arrow([[1780, 215], [1730, 215], [1730, 330], [1680, 330]], { label: ["API", "calls"], labelAt: [1730, 272] });
  c.arrow([[2055, 230], [2055, 270]], { color: COL.violet, label: "chat", labelAt: [2055, 250] });
  c.arrow([[2055, 370], [2055, 410]], { color: COL.violet });
  c.arrow([[1680, 625], [1780, 625]], { color: COL.green, label: ["login", "token"], labelAt: [1730, 625] });

  // pipelines
  c.card(60, 900, 320, 130, COL.amber, "NVIDIA Brev", ["ephemeral GPU and CPU batch", "Prithvi training, hero bundles", "never serves traffic"], I("server"));
  c.card(430, 900, 420, 130, COL.amber, "Pipelines (Python, uv)", ["build demo bundles · capture fixtures", "train the stress model · validation"]);
  c.card(890, 900, 260, 130, COL.amber, "data_store sync.py", ["gcloud storage rsync", "SHA-256 verified"]);
  c.card(1200, 900, 460, 130, COL.grey, "Credentials stay local", ["gcloud login for the bucket", "EARTHDATA_TOKEN from the environment", "nothing is stored in the repo"]);
  c.arrow([[380, 965], [430, 965]], { color: COL.amber });
  c.arrow([[850, 965], [890, 965]], { color: COL.amber });
  c.arrow([[995, 900], [995, 720]], { color: COL.amber, label: ["push", "clips"], labelAt: [995, 790] });

  c.panel(40, 1120, 2320, 190, "Security model", [
    ["No key files", "GitHub authenticates through Workload Identity", "Federation, limited to this one repository."],
    ["Least privilege", "The deployer can only touch itza-* services and the", "itza registry. Runtime reads only its own secrets."],
    ["Private data store", "Uniform access, public access blocked, versioning on,", "old versions deleted after 30 days. Team reads via a group."],
    ["Secrets stay secret", "Earthdata and OpenET keys live in Secret Manager and", "reach the service as env vars. Never in the repo or image."],
  ]);
  c.panel(40, 1340, 2320, 190, "Service settings", [
    ["itza-science-api", "port 8000 · gen2 · 1 GiB · CPU always on", "min and max one instance · public"],
    ["itza-web", "port 8080 · unprivileged nginx", "0 to 3 instances · built with the API URL"],
    ["Delivery", "push to main → build with buildx → Artifact Registry", "→ deploy-cloudrun, API first, then web"],
    ["Region", "europe-west1 for Cloud Run, Artifact Registry", "and the dataset bucket"],
  ]);
  return c;
}

const all = { "tech-overview": overview(), "gcp-deployment": gcpDeploy() };
for (const [name, c] of Object.entries(all)) writeFileSync(`${OUT}/${name}.svg`, c.svg());
console.log("ok", Object.keys(all).join(", "));
