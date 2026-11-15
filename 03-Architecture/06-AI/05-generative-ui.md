# Generative UI design

How the assistant draws answers using a fixed catalog, never model-written code.

**Where the code lives**

- `packages/ui-kit/catalog`

---

## Generative UI design

**Pattern choice (checked 2026-11-10).** 2026 practice names three generative-UI patterns: *static* (agent picks predefined components, frontend owns UI), *declarative* (agent returns a UI description as data; client renders its own trusted components) and *open-ended* (agent or server returns full HTML in a sandboxed iframe, e.g., MCP Apps) ([CopilotKit guide](https://www.copilotkit.ai/blog/the-developer-s-guide-to-generative-ui-in-2026), [AG-UI generative UI specs](https://docs.ag-ui.com/concepts/generative-ui-specs)). The guidance is to pick the least-freedom pattern that meets the need. We use **declarative as the main path, static as the fallback, and no open-ended UI** in the farmer app:

| Layer | Choice | Why |
|---|---|---|
| UI description | **A2UI v0.9.1** (production line; v1.0 is a release candidate) ([spec](https://a2ui.org/specification/v0.9.1-a2ui/), [repo](https://github.com/google/A2UI)) | Declarative JSON, never executable code; agent can only place components registered in our catalog; streaming; Apache-2.0; official React renderer |
| Renderer | `@a2ui/react` with a custom catalog `app-catalog/v1` mapping to `packages/ui-kit` components | Answers look exactly like the rest of the app; accessibility comes for free |
| Transport and chat | Vercel AI SDK 7 (already used): the `render_answer` tool input carries A2UI messages; typed tool parts render static components for single-result answers | A2UI is transport-agnostic (MCP, WebSockets, REST, AG-UI, A2A) ([Google blog](https://developers.googleblog.com/a2ui-v0-9-generative-ui/)); no new runtime needed |
| Data binding | Tool results written with `updateDataModel` at JSON Pointer paths (e.g., `/backtest/rot_b/stress_years`); components bind to paths | Numbers in charts never pass through the LLM's text, which makes grounding structural |
| User actions | A2UI `action` messages (`name`, `sourceComponentId`, `context`) mapped by an allow-list to tools or navigation | Chips and forms are real interactions; unknown actions are dropped |
| Validation | Catalog JSON Schema (`@cfworker/json-schema`, draft 2020-12; Ajv compiles with `new Function`, which Workers forbid) at the gateway and client; A2UI `VALIDATION_FAILED` error returned to the model once | Prompt-generate-validate loop recommended by the spec |

**Catalog** (`packages/ui-kit/catalog/`): `Caption`, `ReplayBars`, `RotationCompare`, `EvidenceCard`, `SeasonSnapshot`, `ClimateStrip`, `FutureToggle`, `MapFocus`, `ConfirmForm`, `ActionChips`, `SourceChips`, `TraceDrawer`, plus layout primitives (`Column`, `Row`, `Card`). Each entry has a JSON Schema, one example surface (few-shot) and a predefined fallback layout per intent.

**Client implementation (#33).** `apps/web/src/assistant/` runs `useChat` (AI SDK 7, `@ai-sdk/react` 4) against the gateway's `/chat` and executes the browser tools in `onToolCall` against the engine worker and the field store; the comparison it needs comes through the same `useCompare` hook as the compare step. The renderer is `@a2ui/react` 0.15 (`v0_9`) with a custom `Catalog` in `packages/ui-kit/catalog/react/` (`AnswerSurface`); the app passes its drawing of the data components in through a `CatalogHost`, so ui-kit imports nothing from the app. A `render_answer` surface is checked with `validateAnswer` before it renders; a surface that fails, or that the gateway answers with `fallback`, shows the predefined layout for its intent. Details that differ from the sketch above: the app, not the model, fills the data model from tool results (data-model writes in a model's surface are ignored), and a tool returns two things, a compact grounded result for the model and a larger view for the components, kept only in the browser. Rotations are named to the model by short handles (`r1`, `r2`, ...) because real rotation ids are longer than a catalog id may be. `set_priorities` and `set_constraints` only fill a `ConfirmForm`; the store changes on Confirm. The panel and its code load on first use, outside the initial bundle.

**Layout rules (consistency).** Max one surface per answer; caption first, then at most 3 data components, then chips and sources; fixed ordering per intent class. This addresses the main generative-UI usability risk: interfaces that change unpredictably and must be relearned ([NN/g](https://www.nngroup.com/articles/generative-ui/)).

**Alternatives considered:** CopilotKit + AG-UI (`@copilotkit/react-core` 1.85, `@ag-ui/client` 1.0.4) if agent logic moves server-side (pydantic-ai, Google ADK and others speak AG-UI; AG-UI carries A2UI) ([AG-UI](https://docs.ag-ui.com/introduction)); Vercel json-render (0.22) as a lighter catalog renderer; MCP Apps (official MCP extension since 2026-01-26) only if ITZA is later exposed as a tool inside third-party chat apps ([MCP blog](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)).
