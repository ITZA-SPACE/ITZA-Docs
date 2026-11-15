# What exists today

A feature-by-feature view of the finished app, with where each part is documented. Names in code style are the folders under `apps/web/src`, `packages/` or `services/`.

## Understand the field

| Feature | Where | Documented in |
|---|---|---|
| Draw a field, search places, click-to-field boundaries | `map/`, `map/clickToField` | [Field boundaries](../03-Architecture/06-AI/03-field-boundaries.md) |
| Field Memory: seasons, crop labels, inferred rotation | `memory/`, `packages/engine/src/memory` | [Field Memory](../03-Architecture/02-Engine/07-field-memory.md) |
| Climate Fingerprint: frost, heat, dry spells, worst seasons | `climate/` | [Engine overview](../03-Architecture/02-Engine/01-overview.md) |
| Map layers, compare slider, SMAP pixel footprint | `map/layers` | [Web app shell](../03-Architecture/04-Front-end/01-web-app-shell.md) |
| 3D field twin: terrain, frames, time-lapse, lidar relief | `twin/` | [3D twin](../03-Architecture/04-Front-end/03-3d-twin.md) |
| Management zones with GeoJSON export | `zones/` | [Terrain, frames and zones](../03-Architecture/05-Back-end/03-terrain-frames-zones.md) |
| NISAR, GRACE and GEDI context | `context/` | [NISAR and landscape context](../03-Architecture/05-Back-end/04-nisar-landscape-context.md) |

## Decide what to plant

| Feature | Where | Documented in |
|---|---|---|
| Farmer inputs: rotation, soil, priorities, constraints, ground truth | `inputs/`, `groundtruth/` | [Routes and features](../03-Architecture/04-Front-end/02-routes-and-features.md) |
| Season Replay of candidate rotations over real seasons | `packages/engine/src/replay` | [Engine overview](../03-Architecture/02-Engine/01-overview.md) |
| Evidence cards, why-not, confidence | `compare/`, `decisions/` | [Scoring, uncertainty and scenarios](../03-Architecture/02-Engine/05-scoring-uncertainty-scenarios.md) |
| Priority sliders and scenario presets | `compare/` | [Worker protocol](../03-Architecture/02-Engine/02-worker-protocol.md) |
| 2050 view with model spread | `future/` | [Scoring, uncertainty and scenarios](../03-Architecture/02-Engine/05-scoring-uncertainty-scenarios.md) |
| Drag-and-drop rotation builder with live curves | `builder/` | [Routes and features](../03-Architecture/04-Front-end/02-routes-and-features.md) |
| Indicative margin from the user's own numbers | `compare/economics`, `packages/engine/src/economics` | [Engine overview](../03-Architecture/02-Engine/01-overview.md) |
| GAEZ suitability evidence | `compare/GaezEvidence` | [Source manifest](../03-Architecture/03-Data/02-source-manifest.md) |

## Trust the answer

| Feature | Where | Documented in |
|---|---|---|
| Model Arena: three opinions and their agreement | `arena/` | [Stress model and arena](../03-Architecture/06-AI/01-stress-model-and-arena.md) |
| LightGBM stress model with SHAP drivers | `pipelines/ml`, `services/science-api` | [Stress model and arena](../03-Architecture/06-AI/01-stress-model-and-arena.md) |
| Prithvi-EO-2.0 crop and fallow (experimental) | `pipelines/prithvi` | [Prithvi](../03-Architecture/06-AI/02-prithvi.md) |
| Validation on proof fields against CDL, PRISM, OpenET | `validation/`, `pipelines/validation` | [Determinism and validation](../03-Architecture/02-Engine/06-determinism-and-validation.md) |
| Provenance chips and gaps shown, never hidden | `packages/ui-kit` | [Principles](../03-Architecture/01-System-Overview/01-principles-and-context.md) |
| Formulas, sources, licenses and credits | `methods/` | [Design system](../03-Architecture/04-Front-end/04-design-system.md) |

## Ask and share

| Feature | Where | Documented in |
|---|---|---|
| Ask ITZA, the visual assistant (A2UI) | `assistant/`, `services/si-gateway`, `packages/ui-kit/catalog` | [Assistant flow](../03-Architecture/06-AI/04-assistant-flow.md) |
| Offline answer templates when the model is unavailable | `assistant/` | [Tools and guardrails](../03-Architecture/06-AI/06-tools-and-guardrails.md) |
| Share link, printable rotation card, QR code | `report/` | [Routes and features](../03-Architecture/04-Front-end/02-routes-and-features.md) |
| Guided demo, fully offline on the hero fields | `demo/` | [Hero-field precompute](../03-Architecture/03-Data/06-hero-field-precompute.md) |
| Installable PWA with offline mode | `pwa/` | [Web app shell](../03-Architecture/04-Front-end/01-web-app-shell.md) |

## Run it

| Feature | Where | Documented in |
|---|---|---|
| Cloud Run deployment on every push to main | `.github/workflows/release.yml` | [Release to Cloud Run](../03-Architecture/07-Build-and-Deploy/02-release-to-cloud-run.md) |
| Shared dataset store on Cloud Storage | `pipelines/data_store` | [Dataset store](../03-Architecture/03-Data/05-dataset-store.md) |
| Cloudflare Worker gateway with limits | `services/si-gateway` | [VPS and Cloudflare](../03-Architecture/07-Build-and-Deploy/04-vps-and-cloudflare.md) |
| CI with offline tests, contracts check and a license gate | `.github/workflows/ci.yml` | [Continuous integration](../03-Architecture/07-Build-and-Deploy/01-continuous-integration.md) |

[Back to the build log](00-README.md)
