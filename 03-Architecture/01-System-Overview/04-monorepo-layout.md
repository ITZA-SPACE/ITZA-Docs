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
│  └─ web/                    React app (map, 3D, cards, builder, assistant, English copy)
├─ packages/
│  ├─ engine/                 Pure TS engine + JSON Schemas + golden tests
│  ├─ adapters-browser/       POWER, ORNL MODIS, CMR adapters (TS)
│  ├─ knowledge/              Region packs (YAML) + schema + validator
│  └─ ui-kit/                 Shared accessible components; catalog/ (A2UI catalog schemas, examples, fallback layouts)
├─ services/
│  ├─ science-api/            FastAPI: bundles, zones, NISAR, projection, ML, tiles
│  └─ si-gateway/             Cloudflare Worker: LLM proxy, MCP client, A2UI catalog validation
├─ pipelines/                 build_demo.py, capture_fixtures.py, train_stress.py, prithvi/
├─ infra/                     docker-compose.yml (VPS), cloudflared config, wrangler config, brev/ job scripts
├─ fixtures/                  Raw API responses + clipped rasters for tests
├─ data-sources.yaml          Adapter manifest
├─ schemas/                   Shared JSON Schemas (source of truth)
└─ docs/                      This documentation
```

Tooling: pnpm workspaces + Turborepo (JS), uv (Python), Biome or ESLint+Prettier, Ruff, Vitest, Playwright, pytest. CI: GitHub Actions (lint, type-check, unit, golden, schema, adapter conformance against fixtures, build).
