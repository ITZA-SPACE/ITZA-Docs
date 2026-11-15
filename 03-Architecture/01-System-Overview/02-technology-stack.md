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
| Map | **MapLibre GL JS** | 6.18 | Open source, no token, 3D terrain, globe projection (since v5) | Mapbox GL (token, terms), Leaflet (no 3D) |
| 3D / analytics layers | **deck.gl** (interleaved with MapLibre) | 9.4 | TerrainLayer, BitmapLayer, GPU heatmaps; strong MapLibre pairing | CesiumJS 1.147 (heavier, globe/3D Tiles), three.js |
| Drawing | **Terra Draw** + MapLibre adapter | 1.39 / 1.5 | Maintained, multi-mode drawing, works with MapLibre | mapbox-gl-draw 1.5 |
| Geospatial utils | **Turf** | 7.4 | Area, centroid, buffers, intersections | — |
| Charts | **ECharts** | 6.1 | Large time series, animations, heat strips | Recharts 3.10 (simpler), Observable Plot |
| Close-up 3D relief | **three.js** | 0.170 | One mesh per field from its height image, with the aerial photo or height colours and a rain sheet (`apps/web/src/twin/relief/`) | deck.gl SimpleMeshLayer |
| Drag and drop | **dnd-kit** (`@dnd-kit/core` + `@dnd-kit/sortable`) | core 6.3, sortable 10 | Accessible (keyboard/touch) DnD for the rotation builder | react-beautiful-dnd (unmaintained) |
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
| Runtime / packaging | Python 3.12+ with **uv** (3.13 in use) | — | Fast, reproducible environments |
| API | **FastAPI** + Uvicorn + Pydantic v2 (+ pydantic-settings) | 0.162 / 0.54 / 2.14 | Typed, OpenAPI generated, team knows it (QFarm backend uses FastAPI) |
| NASA access | **earthaccess** | 0.19 | Official community library: Earthdata Login, CMR search, cloud/HTTPS download |
| Rasters / arrays | **rasterio**, **rioxarray** (with xarray), h5netcdf, h5py, numpy, scipy, affine, pyproj | 1.5 / 0.23 / 1.8 / 3.16 | HDF5/NetCDF/COG handling, clipping, resampling, reprojection |
| Vector | **shapely** | 2.2 | Field geometry, area and clipping |
| Images | Pillow | 13.0 | PNG frames, height images, JPEG fitting |
| HTTP | httpx | 0.28 | Upstream calls with timeouts and retries |
| ML | **LightGBM** (TreeSHAP contributions through `pred_contrib`), scikit-learn (zones: k-means, silhouette, adjusted Rand) | 4.7 / 1.9 | Explainable tabular stress model; deterministic zoning |
| Foundation model (pipelines only) | **TerraTorch** + Prithvi-EO-2.0 tiny-TL | — | CPU experiment in `pipelines/prithvi/`; the API only serves its published rasters and never installs torch |

Considered in the design but **not used**: asf_search and pystac-client (NISAR and HLS are found through earthaccess), geopandas, zarr, Polars, DuckDB (no index is needed over the file cache), TiTiler-CMR (frames are precomputed PNGs instead of dynamic tiles), the separate `shap` package, AquaCrop-OSPy (no reference cross-check has been run) and pydantic-ai (agent logic stays in the gateway).

No relational database is needed for the hackathon: bundles are immutable files keyed by hash; user edits live in the browser and in share links. A hosted DB is a post-event option.

## SI services (all optional, with fallbacks)

| Capability | Default (free, no card) | Fallback | Paid option (not required) |
|---|---|---|---|
| LLM with tool calling and structured output (A2UI surfaces) | Gemini API free tier, model `gemini-3.1-flash-lite` (Google AI Studio key) | Groq free tier, model `openai/gpt-oss-120b`; or template intents with predefined layouts | Claude, GPT, Gemini paid tiers |
| NASA data tools | NASA POWER MCP (no key), NASA CMR MCP (no key) | Direct REST via engine tools | — |

Free-tier limits change frequently (reported Gemini free-tier reductions in Dec 2025 and 2026); the gateway enforces per-session budgets and falls back automatically. Model ids live in `services/si-gateway/src/providers.ts`, because providers retire models.
