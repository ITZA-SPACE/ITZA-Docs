# Gateway and catalog contracts

The exact request, response and answer-catalog shapes.

**Where the code lives**

- `services/si-gateway/src`
- `packages/ui-kit/catalog`

---

## Gateway contract (`services/si-gateway`)

| Item | Value |
|---|---|
| Endpoint | `POST /chat`, body `{ messages: UIMessage[] }` (user and assistant roles only), header `X-Session-Id`; response is an AI SDK UI message stream |
| Providers | Gemini free tier (`gemini-3.1-flash-lite`), then Groq (`openai/gpt-oss-120b`) when the first fails before output; keys only from Wrangler secrets |
| Server tools | NASA POWER MCP (`power_*`) and CMR MCP (`cmr_*`); results `{ untrusted_data, provenance }`; unreachable server = gap |
| Client tools | Declared without `execute`; the browser runs them |
| Limits (`src/budget.ts`, raised in #147) | 40 req/min per IP; 150 requests and 400k tokens per session (one question costs two or three requests); 64 KB body; 40 messages; 1,200 output tokens and 6 steps per request; counters per Worker isolate (best effort, reset on cold start). The web client sends at most the last 36 messages |
| Error signals | `429 rate_limited` (+ `Retry-After`), `429 budget_exhausted` and `503 no_provider` (both carry `fallback: "templates"`), `413`, `400`, `403` |

## Answer catalog contract (`packages/ui-kit/catalog`)

Plain TypeScript (no DOM, no React), imported by the gateway and the web app as `@itza/ui-kit/catalog`.

| Item | Rule |
|---|---|
| Messages | A2UI v0.9: `{ version: "v0.9", createSurface \| updateComponents \| updateDataModel }`, catalog `app-catalog/v1`; one surface per answer; flat component list with a `root` layout component |
| Components | `Caption`, data components (`ReplayBars`, `RotationCompare`, `EvidenceCard`, `SeasonSnapshot`, `ClimateStrip`, `FutureToggle`, `MapFocus`, `ConfirmForm`), footer components (`ActionChips`, `SourceChips`, `TraceDrawer`), layout (`Column`, `Row`, `Card`); each has a JSON Schema with length-limited props |
| Bindings | Data props are `{ path }` JSON Pointers into the data model; the app writes tool results at the standard paths in `DATA_PATHS` |
| Layout | Leaf order: one `Caption`, then at most 3 data components, then footer components; nesting depth ≤ 4; ≤ 40 components |
| Text | Every model-written string must be plain: no `<`, `>`, links, script or data URLs, control characters |
| Actions | `ACTION_ALLOWLIST` maps chip action names to one browser tool or navigation; `resolveAction` validates the context; unknown actions are dropped (an emptied chip block is removed). State changes only through `ConfirmForm` |
| Grounding | `checkGrounding(texts, toolOutputs)`: every number or date in a caption (and every number the model writes with `updateDataModel`) must appear in a tool output of the turn; rounding to the written precision, percent, ×10/÷10 and ×1000/÷1000 unit changes, and array lengths are accepted |
| Fallback | `fallbackSurface(intent, caption)` for each of the 10 `INTENT_CLASSES`; caption copy keys in `FALLBACK_CAPTION_KEYS` (`apps/web/src/copy/en/assistant.json`) |
| `render_answer` | Runs in the gateway (`src/render.ts`): schema or grounding failure returns `status: "error"` with `VALIDATION_FAILED` / `GROUNDING_FAILED` once; a second failure in the same turn returns `status: "fallback"` (with the optional `intent`) and the client shows the predefined layout. Failures are counted across requests from the messages |
