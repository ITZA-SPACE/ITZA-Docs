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
   ┌────────────────────────▼─┐  ┌─────▼──────┐  ┌─▼───────────────────────┐
   │ NASA POWER (daily, clim., │  │ SI gateway │  │ Data & Science service  │
   │ projection) · ORNL MODIS  │  │ (serverless│  │ (Python, FastAPI)       │
   │ REST · CMR search · tiles │  │  worker)   │  │ earthaccess · rasterio  │
   └───────────────────────────┘  └──┬───┬─────┘  │ xarray · ML · TiTiler   │
                                     │   │        └──┬──────────┬───────────┘
                           LLM APIs ◀┘   └▶ NASA MCP │          │ Earthdata Login
                     (Gemini, Groq)     (POWER, CMR) │          ▼
                                                     │   NASA Earthdata Cloud / DAACs
                                                     │   (IMERG, SMAP, HLS, NISAR,
                                                     ▼    GRACE, GEDI, ECOSTRESS),
                                           Static bundle store  NEX-GDDP (AWS S3)
                                           (precomputed demo +
                                            cached fields)
```

## Containers and responsibilities

| Container | Responsibility | Tech | Runs on |
|---|---|---|---|
| **Web app** | UI, map, 3D, charts, state, offline cache, guided demo | React + TypeScript + Vite | Cloudflare edge (static assets) |
| **Engine (`@itza/engine`)** | Pure functions: ET0, water balance, thermal, pest, N, cover, erosion, scoring, resilience, Monte Carlo, delta-change, candidate generation, evidence generation | TypeScript, no DOM deps | Web Worker (browser) and Node (tests, server-side render of PDFs if needed) |
| **Browser adapters** | Fetch POWER, ORNL MODIS, CMR metadata, tiles; normalize to canonical series | TypeScript | Browser |
| **Data & Science service** | Authenticated NASA access, raster clipping/aggregation, bundle building, zones, NISAR/HLS processing, projection fallback, ML inference, PDF rendering (optional) | Python 3.12+, FastAPI | Team VPS (Docker) behind Cloudflare Tunnel |
| **Pipelines** | Batch precompute demo bundles; ML training; fixture capture | Python scripts/notebooks (uv) | Developer machines, CI, NVIDIA Brev batch instances |
| **Tile service** | On-the-fly HLS/IMERG tiles for 3D/2D layers | TiTiler-CMR | Same container as service, or precomputed PNG frames |
| **SI gateway** | Hide API keys; proxy LLM; host MCP client to NASA POWER MCP and CMR MCP; validate generated UI surfaces against the catalog; rate-limit | TypeScript serverless (Cloudflare Workers) | Cloudflare edge (free plan) |
| **Bundle store** | Precomputed Field Data Bundles, frames, zone GeoJSON | Static files (Parquet/JSON/PNG) | Cloudflare static assets (hero fields); VPS for cached and large files |
