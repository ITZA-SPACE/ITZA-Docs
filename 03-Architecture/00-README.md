# Architecture

How ITZA is built, split by subsystem so you can go straight to the part you care about. Each section has an index, and every page says where its code lives.

![ITZA system overview](../Assets/diagrams/tech-overview-dark.png)

![ITZA on Google Cloud](../Assets/diagrams/gcp-deployment-dark.png)

[Back to the docs home](../README.md)

## Start here

| If you want to know | Read |
|---|---|
| Why the system is shaped this way | [Principles and system context](01-System-Overview/01-principles-and-context.md) |
| What every tool and library is for | [Technology stack](01-System-Overview/02-technology-stack.md) |
| What runs where, and what breaks when something is down | [Hosting and compute](01-System-Overview/03-hosting-and-compute.md) |
| How a rotation is scored | [Engine overview](02-Engine/01-overview.md) |
| How NASA data becomes a field bundle | [Field Data Bundle](03-Data/03-field-data-bundle.md) |
| How the screens fit together | [Routes and features](04-Front-end/02-routes-and-features.md) |
| What the API offers | [Route reference](05-Back-end/05-route-reference.md) |
| How the assistant stays grounded | [Assistant flow](06-AI/04-assistant-flow.md) |
| How code reaches production | [Release to Cloud Run](07-Build-and-Deploy/02-release-to-cloud-run.md) |

## Sections

| # | Section | What it covers | Code |
|---|---|---|---|
| 01 | [System overview](01-System-Overview/00-README.md) | Principles, stack, hosting, repository layout | whole repository |
| 02 | [Engine](02-Engine/00-README.md) | Physics, replay, scoring, Monte Carlo, Field Memory, worker | `packages/engine` |
| 03 | [Data](03-Data/00-README.md) | Adapters, manifest, bundle contract, caching, dataset store, hero fields | `packages/adapters-browser`, `data-sources.yaml`, `pipelines/data_store` |
| 04 | [Front-end](04-Front-end/00-README.md) | Shell, routes, 3D twin, design system | `apps/web`, `packages/ui-kit` |
| 05 | [Back-end](05-Back-end/00-README.md) | Science API, ingestion, terrain, context, routes | `services/science-api` |
| 06 | [AI](06-AI/00-README.md) | Stress model, arena, Prithvi, boundaries, assistant, generative UI | `pipelines/ml`, `pipelines/prithvi`, `services/si-gateway`, `packages/ui-kit/catalog` |
| 07 | [Build and deploy](07-Build-and-Deploy/00-README.md) | CI, release, pipelines, Cloudflare, VPS | `.github/workflows`, `infra`, `pipelines` |
| 08 | [Quality](08-Quality/00-README.md) | Performance, reliability, security, testing | across the repository |
| 09 | [Decisions](09-Decisions/00-README.md) | Decision log | |

Package-level reference pages (one per package or service) are in [Components](../04-Components/00-README.md). The story of how it was built is in the [Build log](../10-Build-Log/00-README.md).

## Reading the system top to bottom

1. A farmer draws a field on the **map** (`apps/web`). The field id is a hash of the outline.
2. The **bundle loader** asks the browser adapters for light data (NASA POWER, ORNL MODIS, CMR) and the **science API** for heavy data (IMERG, SMAP, HLS, soil, terrain). Both merge into one [Field Data Bundle](03-Data/03-field-data-bundle.md).
3. The **engine** in a Web Worker turns the bundle into [Field Memory](02-Engine/07-field-memory.md), candidate rotations, a replay of every real season, and scores with bands.
4. The page shows evidence cards, confidence and provenance. The farmer moves sliders, and the worker re-scores instantly.
5. The **assistant** answers questions through the Cloudflare gateway by calling the same engine as tools, and draws its answers from a fixed catalog.
6. Everything that goes to production is built by GitHub Actions and deployed to Cloud Run.
