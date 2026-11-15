# Tools and guardrails

What the assistant can call, and the rules that keep its answers grounded.

**Where the code lives**

- `packages/engine`
- `services/si-gateway/src`

---

## Tools

| Tool | Executes | Returns |
|---|---|---|
| `get_field_summary()` | Browser (engine) | Area, history, climate fingerprint highlights |
| `compare_rotations(ids?)` | Browser | Ranked cards (structured) |
| `run_backtest(rotation, scenario?)` | Browser | Resilience profile |
| `get_season(year)` | Browser | That season's indicators and replay |
| `explain_exclusion(crop)` | Browser | Filter/criterion that excluded the crop |
| `set_priorities(...)`, `set_constraints(...)` | Browser, only through a confirmed `ConfirmForm` action | Updated state |
| `render_answer(messages)` | Gateway validates, browser renders | A2UI surface (catalog components bound to tool data) |
| `navigate(view, params)` | Browser | UI action (open 2050, 3D, zones) |
| `define_term(term)` | Browser (glossary) | Plain definition |
| NASA POWER MCP tools (`get_climatology_data`, `get_point_statistics`, …) | Gateway | Climate facts with POWER provenance |
| NASA CMR MCP tools (keyword mapping, collection search, citations) | Gateway | Dataset references and DOIs |

## Guardrails

- **System policy:** answer only about the field, rotations, data and methods; refuse prescriptions (doses, pesticides), legal/financial advice; always mention local review for risky items.
- **Grounding validator:** extracts numbers/dates from the draft answer and checks each against tool outputs in the turn (tolerance for rounding/unit conversion); on failure, regenerate once, then fall back to a template answer.
- **Language:** the reply follows the language and script of the user's last question (English, French, Darija in Arabic script or Latin letters; English for anything else). `detectLanguage` (`packages/ui-kit/catalog/language.ts`) runs in the gateway and the browser; the gateway adds one language line to the system prompt. Captions and plain text follow it, numbers stay in digits 0-9, tool and field names are not translated. The predefined fallback captions and the offline templates exist in English, French and Arabic (`apps/web/src/copy/assistant-locales/`); the rest of the interface stays English. The grounding validator normalises Arabic-Indic digits, the decimal comma, no-break and plain-space thousands separators and a space before `%`, so a number written in any of those styles is still checked.
- **Budget:** per-session token and request caps at the gateway; graceful degradation to template intents.
- **Transparency:** "How I got this" trace lists tools and sources.
- **UI safety:** only catalog components; no HTML, scripts, iframes or URLs from the model; component props length-limited; actions allow-listed; state changes need a user tap on Confirm.
