# Engine overview

`@itza/engine` is the part of ITZA that answers "which rotation would have held up best, and why". It is pure TypeScript with no DOM, clock or locale, so it runs the same in a Web Worker in the browser, in Node tests and in CI. Given a Field Data Bundle and a few farmer inputs it replays every real past season on every candidate rotation, scores the result and explains it.

**Where the code lives**

- `packages/engine/src` (source) and `packages/engine/test` (golden and property tests)
- Package page: [Components: engine](../../04-Components/packages-engine.md)

## What goes in and what comes out

| In | Out |
|---|---|
| A [Field Data Bundle](../03-Data/03-field-data-bundle.md): daily weather, soil moisture, NDVI, soil, slope, with provenance and gaps | Ranked rotations, each with a score from 0 to 100 |
| A [knowledge pack](../../04-Components/packages-knowledge.md): crops, calendars, pests for the region | Resilience: median, P10 and P90 across seasons, plus a win rate |
| Farmer inputs: current rotation, soil values, priorities, constraints | An evidence card per rotation: why it ranks where it does |
| A scenario: rain and temperature shifts, or a 2050 projection | A confidence level with the reasons behind it |

The output is a labelled counterfactual. Scores compare rotations with each other; they are not yield forecasts, and the label is attached to every result (`replay/label.ts`).

## The pipeline, end to end

1. **Field Memory** reads the NDVI history and finds seasons, crop labels and the current rotation ([Field Memory](07-field-memory.md)).
2. **Scenario**: the weather is shifted for "what if" sliders, or replaced with a delta-change 2050 series ([Scoring, uncertainty and scenarios](05-scoring-uncertainty-scenarios.md)).
3. **Reference evapotranspiration**: FAO-56 Penman-Monteith, one value per day.
4. **Candidates**: hard filters (soil, constraints, cycle length) and then up to six rotations, plus the current one.
5. **Replay**: each candidate runs through every usable real season. Year *n* gets crop *n mod N*.
6. **Daily water balance** with crop stress, thermal stress, pests, nitrogen, cover and erosion ([Core equations](04-core-equations.md)).
7. **Eight criteria**, each scaled 0 to 1, then weighted by the farmer's priority sliders into one score.
8. **Monte Carlo**: 200 seeded draws of the uncertain parameters give bands instead of a single number.
9. **Resilience and confidence**: median, P10 and P90, win rate, and five confidence factors with evidence cards.

## Modules

Each import path is a public module. Everything below is exported from `packages/engine/src/index.ts`.

| Module | Folder | What it does |
|---|---|---|
| `contracts` | `src/contracts` | Generated TypeScript types and JSON Schema validators for the shared contracts (`schemas/` at the repository root is the source of truth) |
| `physics` | `src/physics` | `et0.ts` FAO-56 ET0 · `crops.ts` crop calendar and Kc · `soil.ts` soil parameters · `waterBalance.ts` daily root-zone water balance · `thermal.ts` frost, heat and growing degree days · `forcing.ts` weather on one day grid · `provenance.ts` provenance of derived values · `dates.ts` UTC day numbers |
| `climate` | `src/climate` | Climate Fingerprint: per-season and per-month indicators and the worst seasons (`indicators.ts`, `worst.ts`) |
| `memory` | `src/memory` | Field Memory: `series.ts` area-weighted field mean · `seasons.ts` green-up, peak, senescence, bare windows · `rotation.ts` rotation inference · `types.ts` |
| `replay` | `src/replay` | Season Replay: `simulate.ts` and `run.ts` the replay itself · `score.ts` eight-criteria score · `resilience.ts` · `montecarlo.ts` · `pests.ts` · `erosion.ts` · `soilHealth.ts` nitrogen and cover · `calendar.ts` agricultural years · `stats.ts` quantiles · `label.ts` the counterfactual label |
| `decisions` | `src/decisions` | `candidates.ts` and `constraints.ts` candidate generation · `scenarios.ts` sliders and presets · `projection.ts` delta-change 2050 · `design.ts` the rotation builder · `evidence.ts`, `templates.ts` evidence cards and sentence templates · `confidence.ts` |
| `economics` | `src/economics` | `margin.ts`: an indicative margin proxy from the user's own yield, price and cost numbers. Nothing is defaulted |
| `worker` | `src/worker` | The message protocol, the request handler and a promise client ([Worker protocol](02-worker-protocol.md)) |

## Design rules we hold

- **Pure functions.** No `Date.now()`, no `Math.random()` without a seed, no locale. Day numbers count days since 1970-01-01.
- **Provenance travels.** Every value the engine derives carries the coarsest resolution, the lowest quality and every input source (`physics/provenance.ts`).
- **Plain-English from numbers.** Evidence and confidence sentences come from templates fed by computed results, never from free text (`decisions/templates.ts`). Button and label copy lives in the web app.
- **No hidden defaults for money.** The margin proxy only runs on numbers the user typed in.
- **Fast enough to be interactive.** Budgets are measured with `pnpm --filter @itza/engine bench`; they are kept out of `pnpm test` because coverage instrumentation distorts timing. See [Performance and reliability](../08-Quality/01-performance-and-reliability.md).

## Related pages

[Module layout](03-module-layout.md) · [Core equations](04-core-equations.md) · [Scoring, uncertainty and scenarios](05-scoring-uncertainty-scenarios.md) · [Determinism and validation](06-determinism-and-validation.md) · [Field Memory](07-field-memory.md) · [Worker protocol](02-worker-protocol.md)
