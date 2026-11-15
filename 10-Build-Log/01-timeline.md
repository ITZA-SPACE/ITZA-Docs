# Timeline

Nine phases. Times are from the git history (14 and 15 November 2026). Numbers like #52 are pull requests and issues in [`ITZA-SPACE/itza`](https://github.com/ITZA-SPACE/itza).

## Phase 1 · Foundation (14 Nov, 09:00 to 10:30)

Set up everything the rest depends on.

- PRD v1 and the product documentation
- pnpm + Turborepo monorepo; GitHub Actions CI; release workflow; VPS Compose stack
- Scaffolds for the science API (FastAPI), the SI gateway (Cloudflare Worker) and the web app
- UI kit: accessible components, provenance chips, glossary terms and the methods drawer (#41)
- `/v1/projection`: climate change factors for 2050 (#42)
- SI gateway chat proxy with provider fallback, budgets and NASA MCP tools (#44)
- A2UI answer catalog with schema, grounding and action validators (#45)

## Phase 2 · Contracts, engine and data (14 Nov, 10:30 to 11:35)

Contracts first, so work could run in parallel.

- Shared JSON Schemas, generated types and synthetic fixtures (#46)
- Knowledge packs: schema, validator, story, proof and generic packs (#47)
- **Engine:** FAO-56 physics, water balance and Climate Fingerprint (#48); season replay, scoring, resilience, Monte Carlo and the worker (#52)
- Science API field bundle service with IMERG, SMAP L4 and HLS adapters (#51)
- Browser data adapters and the source manifest (#53)
- Web: file-based routes, per-feature copy, the field store, the map with drawing, the responsive shell

## Phase 3 · Cloud and live data (14 Nov, 11:35 to 13:45)

- **Deploy to Google Cloud Run** on every push to main (#43), with fixes for labels and the container image (#58, #61)
- Earthdata bundle jobs; terrain frames and management zones
- Web: bundle cache, priority series merge, progressive bundle loader, placeholder hero bundles
- Field id fixes so browser and API agree on the same id

## Phase 4 · Field Memory and decisions (14 Nov, 13:45 to 15:20)

- **Field Memory:** NDVI phenology, labels and rotation inference; edge cases for sparse seasons and gaps
- Timeline store and scrubber; map layers, compare slider and the SMAP pixel footprint on the real EASE-Grid cell
- PWA: manifest, precache, install prompt, offline indicator, update toast
- **Decisions:** candidate generator, scenarios, 2050 delta-change, evidence and confidence (#54)

## Phase 5 · The product surfaces (14 Nov, 15:20 to 17:00)

- NASA snapshots and landscape context
- Compare workspace with evidence cards, why-not and the season replay (#71)
- 3D field twin core with terrain and camera presets (#72)
- Indicative margin proxy and economics panel (#67); 2050 view with scenarios and model spread (#73); management zones panel with GeoJSON export (#68)
- Priority and scenario sliders with presets and robustness (#74); history confirmation, bare-soil heat strip and climate fingerprint views (#75)
- **Assistant:** chat panel, A2UI renderer, client tools and confirm flow (#78)
- Farmer inputs (#80) and the drag-and-drop rotation builder (#79)

## Phase 6 · Machine learning and sharing (14 Nov, 17:00 to 19:00)

- **ML stress model:** validated inference with SHAP drivers; regional data capture and reproducible grouped training; measured holdout scores shipped with the model (#77)
- Click-to-field boundary detection (#76), later run as a polled background job (#90)
- Ground-truth input that overrides satellite estimates (#83)
- Share link and printable rotation card with QR code
- **Model Arena:** three opinions, agreement and disagreement flags; disagreements flow into evidence card risks

## Phase 7 · Demo, proof and compliance (14 Nov, 19:00 to 21:35)

- Assistant offline templates, pin and add-to-card, and a scripted evaluation set (#91)
- 3D twin time-lapse with draped frames, overlays and replay sync (#82)
- Validation view (#92); guided demo mode (#93)
- **Hero-field precompute pipeline** and the USDA CDL client (#94); real hero bundles with validated CDL histories (#109); real hero fields in the app with a demo field picker (#110); validation on the real proof fields (#111)
- Apache-2.0 license, third-party register and a license gate in CI
- Guided demo finished offline with a timed schedule (#112)
- Prithvi crop and fallow pipeline and raster endpoint (#113)

## Phase 8 · Submission and the data store (14 Nov, 21:35 to 23:50)

- Data and credits tab with sources, licenses and the statement on AI use
- Submission material: project page copy, references, deck source, with limit checks in CI
- **SSURGO soil** with SoilGrids fallback (#119)
- **Shared dataset store on Cloud Storage** with manifest, checksums and team sync (#116, #123); the science API reads SMAP and IMERG from the store before Earthdata (#128); release keeps the mount, gen2 and secrets (#129)
- GLDAS and NLDAS modeled moisture and ET (#124); GAEZ suitability evidence (#121)
- SI gateway deploy config, current models and a Worker-safe MCP fetch (#142)

## Phase 9 · Design system and polish (15 Nov, 00:00 to 03:10)

- Assistant replies in the user's language and generated screens are more reliable (#151)
- **Space glass design system:** Figma tokens, fonts, glass primitives, dark charts and basemap
- Grouped sidebar, field switcher, top bar; **seven-place** navigation with section tabs
- Mobile bottom navigation with a More sheet and safe-area insets
- Ask ITZA as a full page with a pinned composer
- Formulas typeset with KaTeX; folded evidence, benefits and gaps; compact copy on every page
- Validation season strips and a confusion grid; the guided demo as a presentation shell
- Map icon toolbar and floating drawing bar
- Sources as a full page; share and print dialog with card preview, QR and link
- **Lidar relief view** with elevation colours and rain for the 3D twin (#157)

## How we worked

- **Contracts first**: JSON Schemas, generated types and fixtures before features, so several people could build against them in parallel.
- **One issue, one branch, one pull request**, with `dev` as the integration branch and a bot merging `main` into `dev`.
- **Tests offline**: recorded NASA granule clips and synthetic fixtures, no network in CI.
- **Audits**: findings on closed issues were fixed in a dedicated pass (#96).

[Back to the build log](00-README.md)
