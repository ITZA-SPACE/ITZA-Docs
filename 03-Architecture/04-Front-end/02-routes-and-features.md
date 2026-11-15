# Routes and features

Every screen in the app, the route that serves it and the folder where its code lives. All folders are under `apps/web/src`.

## Routes

| Route | Screen | Code |
|---|---|---|
| `/` | Landing page with the four pillars of ITZA | `routes/index.tsx` |
| `/field` | Map: draw a field, search places, switch layers, compare dates | `map/`, `zones/` |
| `/twin` | 3D field twin: terrain, imagery frames, relief, time-lapse | `twin/` |
| `/history` | Seasons: NDVI history, crop labels, bare-soil strip, confirmation | `memory/` |
| `/climate` | Climate Fingerprint: indicators, stripes, worst seasons | `climate/` |
| `/inputs` | Your farm: rotation, soil, priorities, constraints, ground truth | `inputs/`, `groundtruth/` |
| `/compare` | Ranked rotations, evidence cards, why-not, Season Replay | `compare/` |
| `/builder` | Drag-and-drop rotation builder with live curves | `builder/` |
| `/future` | 2050 view: scenarios, time slider, model spread | `future/` |
| `/arena` | Model Arena: three opinions, agreement and disagreement | `arena/` |
| `/validation` | Proof: season strips, confusion grid, cross-checks | `validation/` |
| `/ask` | Ask ITZA, the full-page assistant | `assistant/` |
| `/demo` | Guided demo with a scripted walkthrough | `demo/` |
| `/sources` | Formulas, validation, data and credits | `methods/` |
| `/settings` | Install, offline and update status | `pwa/` |
| `/diagnostics` | Health and build information | `lib/health.ts` |

## Feature folders

| Folder | Files | What it contains |
|---|---|---|
| `app` | 20 | Root layout, shell, sidebar, bottom bar, page header |
| `state` | 5 | The field store, defaults and per-field persistence |
| `data` | 17 | Bundle loader, cache, priority merge, hero bundles, field-id helpers |
| `map` | 25 | MapLibre view, basemaps, place search, layers, timeline, click-to-field, drawing |
| `twin` | 29 | 3D twin core, draped frames, overlays, camera presets, relief |
| `memory` | 13 | History step: NDVI curve, season detail, bare strip, confirmation |
| `climate` | 8 | Indicator cards, anomaly calendar, stripes, worst seasons |
| `inputs` | 10 | Rotation editor, soil form, constraints, readiness gate |
| `groundtruth` | 6 | Ground-truth input that overrides satellite estimates |
| `compare` | 26 | Compare step, evidence cards, season scores, replay view, economics, GAEZ evidence |
| `builder` | 7 | Palette, timeline, live curves, design store |
| `future` | 5 | 2050 step, climate stripes, resilience change |
| `arena` | 8 | Three-opinion comparison and agreement logic |
| `validation` | 13 | Proof-field checks, confusion grid, cross-checks, methods tab |
| `zones` | 8 | Management zones panel, overlay, GeoJSON export, backtest |
| `context` | 3 | NISAR and landscape context panel |
| `assistant` | 30 | Chat panel, A2UI renderer, client tools, confirm flow, offline templates |
| `demo` | 16 | Guided demo steps and presentation shell |
| `report` | 7 | Share link, printable rotation card, QR, restore from link |
| `methods` | 8 | Formulas typeset with KaTeX, credits, methods drawer |
| `pwa` | 4 | PWA status and settings |
| `lib` | 9 | Config, ECharts setup, palettes, formatters, safe storage |
| `copy` | 41 | One JSON file per feature |

## Shared UI kit

`packages/ui-kit/src/components` holds the shared, accessible primitives: Badge, Button, Card, ConfidenceBadge, Dialog, Disclaimer, Disclosure, EmptyState, IconButton, Popover, ProvenanceChip, Select, Skeleton, Slider, TableScroll, Tabs, Term, Toggle and Tooltip. `ProvenanceChip` shows where a value came from; `ConfidenceBadge` shows how much to trust it; `Term` links a word to the glossary. The A2UI answer catalog the assistant draws from lives in `packages/ui-kit/catalog` ([Generative UI](../06-AI/05-generative-ui.md)).

## Related pages

[Web app shell](01-web-app-shell.md) · [Design system](04-design-system.md) · [Components: UI kit](../../04-Components/packages-ui-kit.md)
