# Monorepo layout

How the repository is organised and which tooling holds it together.

**Where the code lives**

- `pnpm-workspace.yaml`
- `turbo.json`

---

## Repository structure (monorepo)

```
/
├─ apps/
│  └─ web/                    React app (map, 3D twin and relief, cards, builder, assistant, English copy);
│                             public/bundles/ holds the hero-field publications
├─ packages/
│  ├─ engine/                 Pure TS engine; contracts/generated types from /schemas; golden, property and FAO tests; bench/
│  ├─ adapters-browser/       POWER, ORNL MODIS, SoilGrids, CMR adapters (TS)
│  ├─ knowledge/              Region packs (YAML) + schema + validator
│  └─ ui-kit/                 Shared accessible components; catalog/ (A2UI catalog schemas, examples, fallback layouts,
│                             grounding and language checks)
├─ services/
│  ├─ science-api/            FastAPI: bundles, soil, terrain, relief, frames, zones, outlines, context, NISAR,
│  │                          projection, ML stress, Prithvi publications; models/stress-v1
│  └─ si-gateway/             Cloudflare Worker: LLM proxy, MCP client, A2UI catalog validation; eval/ scripted questions
├─ pipelines/                 build_demo.py, refresh_*.py, validate_bundle.py, capture_fixtures.py,
│                             ml/ (train.py), prithvi/, validation/, data_store/
├─ infra/                     docker-compose.yml (VPS fallback with cloudflared) and README (Cloud Run setup)
├─ .github/workflows/         ci.yml, release.yml (Cloud Run), sync-dev.yml
├─ fixtures/                  Recorded API responses and clipped rasters for tests
├─ data-sources.yaml          Adapter manifest
├─ schemas/                   Shared JSON Schemas (source of truth)
└─ docs/                      This documentation
```

Tooling: pnpm workspaces + Turborepo (JS), uv (Python), Biome, Ruff, mypy (strict), Vitest, pytest, fast-check (property tests). CI (`ci.yml`, on pull requests and pushes to `main` and `dev`): science-api lint, types and tests; si-gateway lint, types, tests and bundle; contracts (schemas, engine and knowledge tests, generated files current); frontend lint, types, tests and build; pipelines, dataset store and Prithvi offline tests; science-api Docker build. Dependabot proposes dependency updates. Playwright is not used.
