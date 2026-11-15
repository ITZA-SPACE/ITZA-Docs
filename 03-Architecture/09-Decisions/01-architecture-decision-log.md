# Architecture decision log

The decisions that shaped the system, and why.

---

## Architecture decision log

| ADR | Decision | Rationale | Trade-off |
|---|---|---|---|
| 001 | Engine in TypeScript, in the browser | Instant interaction, offline demo, zero server cost, one implementation for UI and assistant tools | ML and raster work stay in Python; need cross-language schemas |
| 002 | MapLibre + deck.gl over CesiumJS | Lighter, open, strong 2.5D terrain and analytic layers | No true 3D Tiles globe (not needed) |
| 003 | Two-tier harmonization instead of one grid | Avoids false precision from upsampling coarse data; keeps field-scale where it exists | Two code paths (series + zone grid) |
| 004 | Precomputed demo bundles | Demo cannot fail on network or quotas | Build step; bundles must be regenerated after data changes |
| 005 | Adapter manifest + canonical variables | Official resources plug in on Nov 13 without engine changes | Small upfront abstraction cost |
| 006 | FAO-56 single Kc water balance (not full crop model) | Transparent, fast, published, explainable to judges | Not a yield model; dual Kc / AquaCrop reserved for validation (the AquaCrop cross-check has not been run) |
| 007 | LightGBM + SHAP for ML opinion; Prithvi as stretch | Explainable, trainable in hours on CPU; GeoFM adds NASA-native SI | Prithvi fine-tuning needs labels and compute |
| 008 | Tool-grounded assistant with validator | Prevents fabricated numbers | Extra latency; template fallback needed |
| 009 | No server database in hackathon build | Fewer moving parts | No multi-user persistence (post-event) |
| 010 | Edge-first hosting: static app and gateway on Cloudflare, Python service on the team VPS behind Cloudflare Tunnel | Free edge, no open ports, persistent service without a card | Live new-field heavy layers depend on VPS availability. **Serving part superseded by 013**; the VPS stack remains a manual fallback |
| 013 | Google Cloud Run hosts the web app and Data & Science API (continuous delivery from `main`) | Team has GCP credits; scales to zero; no VPS to maintain; supersedes the VPS part of 010 for serving | Cold starts; the SI gateway stays a Cloudflare Worker |
| 011 | NVIDIA Brev for batch compute only | GPU on demand from team credits; nothing idles; demo never depends on an ephemeral instance | Outputs must be copied off before stop/delete; capacity can be unavailable at restart |
| 012 | Generative UI assistant (declarative A2UI catalog) | Visual answers suit low-literacy users better than long text, show the evidence directly, and reuse the app's components | Catalog must be designed and kept in sync with ui-kit; LLM must produce valid structured output (fallback layouts cover failures) |


### SSURGO soil integration (#104)

The science API's `SoilAdapter` fills live bundle soil with SSURGO (US) and per-property
SoilGrids fallback. Soil survey/version, aggregation coverage, drainage and hydrologic
categories are served separately at `/v1/bundles/{id}/soil`, preserving the existing
numeric soil contract. Bundle cache response version 4 (now 5, `RESPONSE_VERSION` in `api/bundles.py`) prevents reuse of earlier
soil-free server bundles. Test fixtures explicitly disable live soil HTTP unless
an offline transport is installed. See NASA_DATA_SOURCES.md for the weighting method.

Bundle status, series and soil routes all require 64-character lowercase hexadecimal
bundle IDs (422 otherwise); valid absent IDs return 404. Demo soil is refreshed
independently with `pipelines/refresh_soil.py`, preserving NASA and Prithvi assets
while staging and re-hashing each publication. `soil.json` holds the detailed source
versions and categorical soil attributes next to the numeric bundle soil values.
