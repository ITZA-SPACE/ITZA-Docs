# Technology stack

Every library and tool we chose, with the reason and the alternative we rejected.

**Where the code lives**

- `package.json`
- `pnpm-workspace.yaml`
- `services/science-api/pyproject.toml`

---

## Technology stack

Versions are the latest published on npm/PyPI on 2026-11-08; pin exact versions at repository creation.

## Frontend

| Concern | Choice | Version | Why | Alternatives |
|---|---|---|---|---|
| Framework | **React** + **TypeScript** | react 19.3, TS 7.0 | Team familiarity, ecosystem, agents generate it well | Svelte, Vue |
| Build | **Vite** | 8.3 | Fast dev server, static output | Next.js (unnecessary SSR) |
| Routing / data fetching | TanStack Router + TanStack Query | 1.170 / 5.107 | Typed routes; caching, retries, progressive loading | React Router |
| State | **Zustand** | 5.1 | Small, simple global state (field, inputs, scenario) | Redux Toolkit |
| Styling / UI | **Tailwind CSS** + headless accessible primitives (Radix-based component kit); DM Sans and Familjen Grotesk (Fontsource, bundled); Lucide icons; KaTeX for formulas | 4.3 | Fast iteration, accessible primitives; fonts work offline | CSS modules |
| Map | **MapLibre GL JS** | 6.17 | Open source, no token, 3D terrain, globe projection (since v5) | Mapbox GL (token, terms), Leaflet (no 3D) |
| 3D / analytics layers | **deck.gl** (interleaved with MapLibre) | 9.4 | TerrainLayer, BitmapLayer, GPU heatmaps; strong MapLibre pairing | CesiumJS 1.147 (heavier, globe/3D Tiles), three.js |
| Drawing | **Terra Draw** + MapLibre adapter | 1.39 / 1.5 | Maintained, multi-mode drawing, works with MapLibre | mapbox-gl-draw 1.5 |
| Geospatial utils | **Turf** | 7.4 | Area, centroid, buffers, intersections | — |
| Charts | **ECharts** | 6.1 | Large time series, animations, heat strips | Recharts 3.10 (simpler), Observable Plot |
| Drag and drop | **dnd-kit** (`@dnd-kit/react`) | 0.5 (core 6.3) | Accessible (keyboard/touch) DnD for the rotation builder | react-beautiful-dnd (unmaintained) |
| UI copy | One English strings file (`en.json`), plain typed lookup; no i18n library | — | English only; keeps a seam for post-event localization at zero cost | i18next (post-event, if localized) |
| SI client | **Vercel AI SDK** (`ai`, `@ai-sdk/react`) | 7.0 / 4.0 | Streaming chat, tool calling with client-side tool execution, typed tool parts for static generative UI, provider-agnostic | Direct REST |
| Generative UI | **A2UI** protocol v0.9.1 + `@a2ui/react` renderer with the app's own catalog (§10.2) | 0.15 | Declarative, catalog-restricted, streaming UI from the assistant; no model-written code | CopilotKit + AG-UI, json-render |
| Offline | IndexedDB (via idb-keyval) + service worker (vite PWA plugin) | — | Cache bundles; P2 installable PWA | — |
| PDF | Browser print stylesheet → PDF (P1); server-side WeasyPrint 70 if needed | — | Fonts and layout handled by browser | jsPDF |

Basemaps and terrain: OpenFreeMap vector style (the "dark" style, no key), EOxCloudless 2016 Sentinel-2 imagery (CC BY 4.0, attribution shown on the map), AWS Terrain Tiles (Terrarium encoding, SRTM-derived, no key). All returned HTTP 200 on 2026-11-08.

**Implementation notes: web shell (`apps/web`).** Routing is TanStack Router file-based (a route per file under `src/routes/`, the tree generated and not committed); the app frame (`src/app/RootLayout.tsx`, `src/app/shell/`) is the Figma web dashboard: a collapsible glass sidebar (remembered per browser; collapsed it is an icon rail with tooltips) with seven places from the Figma "Simple · Field" frame (Field, Past, Plan, Future, Decide, Ask ITZA, Sources; Sources is the full `/sources` page with Formulas, Validation and Data and credits tabs) plus Guided demo and Settings as icon buttons, a top bar with the field switcher, and a shared `PageHeader`. Each place is a section whose pages show as segmented tabs in the page header (`src/app/shell/nav.ts`: Map | 3D, Seasons | Climate, Your farm | Compare | Build, Models | Validation), so every route is two clicks away. Phones and tablets are the primary target: the sidebar gives way to a bottom bar (Field, Past, Plan, Ask, More; labels always visible, safe-area insets for the installed PWA) and "More" opens the remaining places as tiles in a bottom sheet. Copy is kept short (one-line page subtitles, 1–3 word buttons); secondary detail (soil, priorities, limits, ground truth, prices, satellite context, zone notes, score breakdowns, climate stripes) folds behind labeled disclosures. Ask ITZA is a full page (`/ask`): the chat stays mounted at the root once loaded and draws into the page through a portal, so a conversation survives a trip to the map and back; "Ask about this" queues a question and opens the page. Dense content uses progressive disclosure (`Disclosure`: evidence, benefits and information gaps fold behind labeled counts while risks stay open; dated gaps are grouped), wide tables scroll inside `TableScroll`, and the Sources page typesets its formulas with KaTeX (HTML plus MathML), loaded only when a formula is shown. The map workspace is a layout route that keeps the map mounted: the map page (`/field`) shows it in a glass frame with the field panel beside it (a bottom sheet on phones), and every other workspace page takes the full width while the map stays mounted, hidden. The guided flow (Field, History, Inputs, Compare) is walked with Back / Next on each step page. Copy is one JSON file per feature under `src/copy/en/`, with the `t(key)` key type generated from them. The field store (Zustand) holds the outline and its derived area, centroid and perimeter, the confirmed history, farmer inputs, priorities, scenario and ground truth; it is serializable and saved per field (id = `sha256:` of the outline rounded to 5 decimals, the bundle contract). Visual design follows the Figma design system "ITZA / design system" (dark "space glass" theme): tokens live in `packages/ui-kit/src/tokens.css` (surfaces, text, brand light and status colors, radii, type scale, the `glass-panel`, `glass-control`, `glass-selected` and `bg-aurora` utilities) and every component reads them, so charts (`src/lib/palettes.ts`, the `itza` ECharts theme), the map controls and the printed rotation card (a light palette under `@media print`) stay consistent. Place search uses Photon, debounced and cached. MapLibre's tile worker is registered through Vite (`?worker&url`) because the library cannot locate it once bundled; `maplibre-gl` and Terra Draw load only with the workspace route.

## Backend and science

| Concern | Choice | Version | Why |
|---|---|---|---|
| Runtime / packaging | Python 3.12+ with **uv** | — | Fast, reproducible environments |
| API | **FastAPI** + Uvicorn + Pydantic v2 | 0.162 / 0.54 / 2.14 | Typed, OpenAPI generated, team knows it (QFarm backend uses FastAPI) |
| NASA access | **earthaccess** | 0.19 | Official community library: Earthdata Login, CMR search, cloud/HTTPS download, streaming |
| SAR (NISAR) search | **asf_search** | 14.1 | ASF DAAC search/download |
| STAC | pystac-client | 0.9 | HLS via CMR-STAC |
| Rasters / arrays | **xarray**, **rioxarray**, **rasterio**, h5netcdf, zarr | 2026.9 / 0.24 / 1.5 / 1.8 / 3.4 | HDF5/NetCDF/COG handling, clipping, resampling |
| Vector | geopandas, shapely | 1.2 / 2.2 | Field geometry ops |
| Tabular | **Polars** (+ pandas 3 where libraries require) | 2.1 | Fast series aggregation |
| Local analytics store | **DuckDB** (spatial extension) | 2.0 | Query cached bundles/Parquet without a server DB |
| Tiles | **TiTiler-CMR** | 1.0.x | Dynamic HLS/IMERG tiles straight from CMR |
| ML | **LightGBM**, **SHAP**, scikit-learn | 4.7 / 0.54 / 1.9 | Explainable tabular stress model |
| Foundation model | **TerraTorch** + Prithvi-EO-2.0 (tiny-TL / 100M-TL) | 1.2 | NASA/IBM GeoFM fine-tuning and inference |
| Reference crop model (validation) | **AquaCrop-OSPy** (`aquacrop`) | 3.1 | Cross-check water-balance behavior |
| SI agent (server-side option) | **pydantic-ai** with MCP client | 2.66 | If agent logic moves server-side |

No relational database is needed for the hackathon: bundles are immutable files keyed by hash; user edits live in the browser and in share links. A hosted DB is a post-event option.

## SI services (all optional, with fallbacks)

| Capability | Default (free, no card) | Fallback | Paid option (not required) |
|---|---|---|---|
| LLM with tool calling and structured output (A2UI surfaces) | Gemini API free tier (Google AI Studio key; limits shown per project in AI Studio) | Groq free tier (Llama/Qwen models), or template intents with predefined layouts | Claude, GPT, Gemini paid tiers |
| NASA data tools | NASA POWER MCP (no key), NASA CMR MCP (no key) | Direct REST via engine tools | — |

Free-tier limits change frequently (reported Gemini free-tier reductions in Dec 2025 and 2026); the gateway enforces per-session budgets and falls back automatically.
