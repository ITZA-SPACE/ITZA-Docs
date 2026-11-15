# VPS and Cloudflare

Two places outside Google Cloud take part in delivery: the Cloudflare Worker that proxies the assistant, and a Docker Compose stack kept as a manual fallback.

## SI gateway on Cloudflare Workers

- **Code:** `services/si-gateway`, deployed with `pnpm --filter @itza/si-gateway deploy` (Wrangler).
- **Why Cloudflare:** the Worker keeps model API keys off the client, runs on the free plan, and needs only I/O, so the 10 ms CPU limit is enough.
- **What it does:** streams chat through the Vercel AI SDK with provider fallback (Gemini 3.1 Flash-Lite, then Groq `gpt-oss-120b`), hosts the MCP client for NASA POWER and CMR, validates generated A2UI surfaces against the app catalog, and enforces limits ([Gateway and catalog contracts](../06-AI/07-gateway-and-catalog-contracts.md)).
- **Limits** (`src/budget.ts`, raised in #147 so a long demo does not run out): 40 requests per minute per IP, 150 requests and 400k tokens per session, 64 KB body, 40 messages, 1,200 output tokens and 6 steps per request. Counters live in the Worker isolate, so they are best effort and reset on cold start.

## VPS fallback

`infra/docker-compose.yml` runs the science API on a team VPS, with `cloudflared` as the only route in (no inbound ports):

```bash
cp infra/.env.example infra/.env        # fill in values
docker compose -f infra/docker-compose.yml --profile tunnel up -d
```

The science API container is hardened: read-only filesystem with a tmpfs for `/tmp`, `no-new-privileges`, and a loopback-only port. It builds from `services/science-api/Dockerfile`.

This stack is the fallback. The primary deployment is Cloud Run ([Release to Cloud Run](02-release-to-cloud-run.md)).

## Related pages

[Hosting and compute](../01-System-Overview/03-hosting-and-compute.md) · [Components: SI gateway](../../04-Components/services-si-gateway.md)
