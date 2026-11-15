# ITZA SI gateway

Cloudflare Worker between the browser and language-model APIs. It keeps API keys off the client, proxies the LLM, hosts the MCP client for NASA POWER MCP and CMR MCP, validates generated A2UI surfaces against the app catalog and enforces rate limits. See [Architecture docs](../03-Architecture/00-README.md).

Routes:

- `GET /health`: liveness.
- `POST /chat`: streams a Vercel AI SDK UI message stream (`{ messages: UIMessage[] }`, header `X-Session-Id`, 8 to 64 chars of `A-Za-z0-9_-`). Needs an allow-listed `Origin`.

Every response enforces the origin allow-list (`ALLOWED_ORIGINS`).

`/chat` behavior:

- Models: Gemini free tier first (`gemini-3.1-flash-lite`), Groq (`openai/gpt-oss-120b`) when Gemini fails before output (quota, auth, 5xx). A provider without a key is skipped. No key at all returns `503 {"error":"no_provider","fallback":"templates"}`.
- Tools: client tools (engine, glossary, UI) are declared without `execute` and run in the browser. NASA POWER MCP and NASA CMR MCP tools run in the gateway as `power_*` / `cmr_*`; each result is `{ untrusted_data, provenance }`. An MCP server that is down is skipped. Only those two fixed URLs are ever fetched.
- Policy: system prompt in `src/policy.ts`. Clients cannot send `system` messages.
- Limits (`src/budget.ts`, raised in #147 so a long demo does not run out): 40 requests/min per IP (`429 rate_limited` + `Retry-After`); 150 requests and 400k tokens per session (`429 budget_exhausted`, `fallback: "templates"`); 64 KB body (`413`); 40 messages; 1,200 output tokens and 6 steps per request. Counters live in the Worker isolate, so they are best effort and reset on cold start.
- Provider errors are never forwarded: the stream carries `provider_error`, logs carry only an error name and status.

| Task | Command |
|---|---|
| Dev server (port 8790) | `pnpm dev` |
| Tests + coverage (≥ 90%) | `pnpm test` |
| Type check | `pnpm typecheck` |
| Bundle check (no deploy) | `pnpm build` |
| Deploy | `pnpm deploy` (needs `wrangler login` or `CLOUDFLARE_API_TOKEN`) |

Secrets: copy `.dev.vars.example` to `.dev.vars` for local runs; use `wrangler secret put` in production.

## Evaluation set

`eval/` holds the ten scripted demo questions with recorded provider responses and recorded browser tool results. `eval/eval.test.ts` runs each through `/chat` as the browser does (a request where the model calls a tool, then one that carries its result) and asserts at least one tool call, a catalog-valid surface and grounded numbers, plus a control that an ungrounded caption fails. It needs no network or key and runs with `pnpm test`.
