# Assistant flow

What happens between a question and an answer.

**Where the code lives**

- `apps/web/src/assistant`
- `services/si-gateway/src`

---

## Flow

```
typed text · suggested chip · "Ask about this" (element context)
   │
   ▼
AI SDK chat (browser) ─▶ SI gateway (Worker) ─▶ LLM (Gemini | Groq)
                              │
          tool calls ◀────────┘
client data tools (engine)       server data tools (NASA POWER MCP, CMR MCP)
          │                                │
          └────────── results ─────────────┘
                    │  written to the surface data model (bindings)
                    ▼
LLM calls render_answer(A2UI messages: createSurface · updateComponents)
                    │
                    ▼
catalog schema check (gateway + client) ── fail ─▶ one self-correction ─▶ predefined layout
                    │ pass
                    ▼
caption grounding validator ─▶ A2UI React renderer (app catalog) ─▶ interactive answer
                    ▲                                                       │
                    └──────── A2UI `action` (chip tap, Confirm) ◀───────────┘
```
