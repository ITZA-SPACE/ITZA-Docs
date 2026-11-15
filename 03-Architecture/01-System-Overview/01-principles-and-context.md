# Principles and system context

Why the system is shaped the way it is, who talks to whom, and what each container is responsible for.

**Where the code lives**

- `apps/web`
- `packages/engine`
- `services/science-api`
- `services/si-gateway`

---

## Architecture principles

1. **Browser-first engine.** The simulation engine runs client-side in a Web Worker: sliders re-rank instantly, the demo works offline, and server cost stays at zero.
2. **Contracts before code.** JSON Schemas define the Field Data Bundle, knowledge packs, engine inputs/outputs and evidence cards. Parallel agents build against schemas and fixtures.
3. **Adapters isolate data sources.** The engine sees canonical variables only. Adding or replacing a dataset is a manifest entry plus an adapter.
4. **Precompute what is slow, fetch what is cheap.** Authenticated, heavy rasters (HLS, NISAR, SMAP, IMERG, GRACE) are processed by Python and cached as bundles; light no-auth APIs (POWER, ORNL MODIS, CMR) are called directly from the browser (CORS verified).
5. **Provenance is data.** Source, version, resolution, period and quality travel with every value end to end.
6. **Grounded SI.** Language models route and phrase; tools compute. No tool, no number.
7. **Free by default.** Every core component runs on free tiers without a credit card; paid options are documented as optional.
8. **Boring where possible, novel where it shows.** Mainstream stack; novelty is in the product (replay, field memory, 2050, 3D, generative UI assistant).

## System context

```
                         ┌───────────────────────────────┐
     Farmer / advisor ──▶│        Web app (browser)       │◀── Judge (guided demo)
       (mobile/desktop)  │ React UI · MapLibre/deck.gl    │
                         │ Engine Web Worker · IndexedDB  │
                         └──┬──────────┬───────────┬──────┘
          no-auth, CORS     │          │           │ HTTPS
   ┌────────────────────────▼─┐  ┌─────▼──────┐  ┌─▼────────────────────────┐
   │ NASA POWER daily · ORNL   │  │ SI gateway │  │ Data & Science service   │
   │ MODIS REST · SoilGrids ·  │  │ (Cloudflare│  │ (Python, FastAPI, on     │
   │ CMR search · basemaps     │  │  Worker)   │  │  Cloud Run) earthaccess  │
   └───────────────────────────┘  └──┬───┬─────┘  │ rasterio · xarray · ML   │
                                     │   │        └──┬──────────┬────────────┘
                           LLM APIs ◀┘   └▶ NASA MCP │          │ Earthdata Login
                     (Gemini, Groq)     (POWER, CMR) │          ▼
                                                     │   NASA Earthdata Cloud / DAACs
                                                     │   (IMERG, SMAP, HLS, GLDAS/NLDAS,
                                                     │    NASADEM, NISAR, GRACE, GEDI,
                                                     │    ECOSTRESS) · POWER projection
                                                     ▼    · USDA SSURGO · USGS 3DEP/NAIP
                                      Dataset store (GCS, read-only clips)
                                      + file cache of built bundles;
                                      hero bundles ship inside the web image
```

## Containers and responsibilities

| Container | Responsibility | Tech | Runs on |
|---|---|---|---|
| **Web app** | UI, map, 3D, charts, state, offline cache, guided demo | React + TypeScript + Vite | Browser; served by Cloud Run service `itza-web` (nginx) |
| **Engine (`@itza/engine`)** | Pure functions: ET0, water balance, thermal, pest, N, cover, erosion, scoring, resilience, Monte Carlo, delta-change, candidate generation, evidence generation | TypeScript, no DOM deps | Web Worker in the browser for the comparison, 2050, builder and assistant tools; the screen's thread for Field Memory, the Climate Fingerprint, zone backtests and the Akron check; Node for tests and pipelines |
| **Browser adapters** | Fetch POWER, ORNL MODIS, SoilGrids and CMR metadata; normalize to canonical series | TypeScript | Browser |
| **Data & Science service** | Authenticated NASA access, raster clipping/aggregation, bundle building, terrain, relief, zones, field outlines, landscape context, projection factors, ML inference | Python 3.12+ (3.13 in use), FastAPI | Cloud Run service `itza-science-api` ([ADR 013](../09-Decisions/01-architecture-decision-log.md)); Docker Compose behind Cloudflare Tunnel is the manual fallback |
| **Pipelines** | Batch precompute demo bundles; ML training; Prithvi; validation captures; dataset store sync | Python scripts (uv) | Developer machines; an NVIDIA Brev instance is optional (scripted, never serves) |
| **Frames and layers** | NDVI/moisture frames for the 3D and 2D layers | Precomputed PNG frames served by the science API or shipped with hero bundles (no tile server) | Science API / web image |
| **SI gateway** | Hide API keys; proxy LLM; host MCP client to NASA POWER MCP and CMR MCP; validate generated UI surfaces against the catalog; rate-limit | TypeScript serverless (Cloudflare Workers) | Cloudflare edge (free plan) |
| **Bundle store** | Precomputed Field Data Bundles, frames, terrain, relief, zone GeoJSON | Static files (JSON/PNG/JPEG/GeoTIFF) | Hero fields inside the web image (`apps/web/public/bundles/`); built bundles in the science API's file cache; large NASA clips in the GCS dataset store |
