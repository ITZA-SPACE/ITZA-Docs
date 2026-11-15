# Hosting and compute

Where each part runs, why it runs there, and what still works when one part fails.

**Where the code lives**

- `.github/workflows/release.yml`
- `infra/docker-compose.yml`
- `services/si-gateway/wrangler.jsonc`
- `pipelines/`

---

## Hosting and compute

**As deployed ([ADR 013](../09-Decisions/01-architecture-decision-log.md)):** Google Cloud Run serves the web app and the Data & Science API, Cloudflare Workers runs the SI gateway, and batch jobs run on developer machines. This supersedes the serving part of ADR 010 (Cloudflare static assets plus a team VPS behind Cloudflare Tunnel), which remains as a manual fallback.

```
 Browser ──HTTPS──▶ Cloud Run itza-web (nginx :8080, europe-west1)
            │         web app + hero-field bundles (apps/web/public/bundles), 0 to 3 instances
            ├──────▶ Cloud Run itza-science-api (FastAPI :8000, gen2, 1 GiB, CPU always on, 1 instance)
            │         ├─ dataset store: GCS bucket mounted read-only at /data/store
            │         ├─ Secret Manager: EARTHDATA_TOKEN, OPENET_API_KEY
            │         └─ file cache in /tmp/itza (lost when the instance is replaced)
            └──────▶ Cloudflare Worker itza-si-gateway (LLM proxy, MCP client, UI validation)
 GitHub Actions release.yml (push to main) ── Workload Identity Federation ──▶ Artifact Registry ──▶ Cloud Run
 Developer machines (optional NVIDIA Brev CPU/GPU instance) ── batch outputs ──▶ repository / dataset store
```

| Layer | Runs | Why here | Key facts |
|---|---|---|---|
| **Cloud Run `itza-web`** | The built web app and the hero-field bundles (nginx) | Team has GCP credits; scales to zero; no VPS to maintain | Port 8080, min 0 and max 3 instances, built with `VITE_SCIENCE_API_URL` and `VITE_SI_GATEWAY_URL` |
| **Cloud Run `itza-science-api`** | Data & Science API | Persistent warm process for live new-field requests; holds the Earthdata token | Port 8000, second-generation runtime, 1 GiB, CPU not throttled, min and max one instance, public (`--allow-unauthenticated`); GCS dataset store mounted read-only; secrets from Secret Manager. In-memory jobs are lost when the instance restarts; clients POST again |
| **Cloudflare Worker** (free plan) | SI gateway | Keeps model keys off the client; I/O-bound, so 10 ms CPU per request is enough ([Workers limits](https://developers.cloudflare.com/workers/platform/limits/)) | Deployed by hand with `pnpm --filter @itza/si-gateway deploy`; secrets with `wrangler secret put` |
| **Developer machines** (batch) | Hero-field bundle precomputation, ML training, Prithvi experiment, validation captures, dataset store sync | Credentials stay local; outputs are committed or synced | NVIDIA Brev scripts exist (`pipelines/prithvi/brev.sh`, README commands for an existing CPU instance); the measured Prithvi run used local CPU and the Brev lifecycle has not been executed |
| **Fallback: team VPS** | `infra/docker-compose.yml`: science-api + `cloudflared` | Manual fallback if Cloud Run is unavailable | Loopback-only port, read-only container, no inbound ports (Cloudflare Tunnel) |

**Rules**

- **Batch never serves.** Pipeline and Brev outputs (bundles, model weights, frames, metrics) go to the repository or the dataset store; the live demo never depends on a batch instance.
- **Pick the Brev provider/region with care** if Brev is used: prefer AWS `us-west-2` for jobs that read Earthdata Cloud; otherwise use HTTPS access via `earthaccess`.
- **Quick tunnels are for development only.** `trycloudflare.com` needs no account but has no uptime guarantee, a random hostname, a limit of 200 in-flight requests and no Server-Sent Events.

**Failure behavior**

| Failure | Effect | What still works |
|---|---|---|
| Science API down or without credentials | Live new-field heavy layers (IMERG, SMAP, HLS, zones, terrain, outlines, context) unavailable | Hero fields fully (static bundles); new fields with browser-side sources (POWER, ORNL MODIS, SoilGrids) |
| SI gateway quota exhausted or no key | LLM answers unavailable | Template intents rendering predefined answer layouts |
| Batch credits exhausted | No new batch jobs | Everything already precomputed |

**Paid options (not required):** a larger Cloud Run instance, Cloudflare Workers Paid ($5/month) for higher limits, Brev top-up credits, AWS `us-west-2` for in-region Earthdata Cloud access.

Because the hero fields are fully precomputed and shipped inside the web image, they work even if the science API is offline.

## Related pages

[Release to Cloud Run](../07-Build-and-Deploy/02-release-to-cloud-run.md) · [VPS and Cloudflare](../07-Build-and-Deploy/04-vps-and-cloudflare.md) · [Data and ML pipelines](../07-Build-and-Deploy/03-data-and-ml-pipelines.md)
