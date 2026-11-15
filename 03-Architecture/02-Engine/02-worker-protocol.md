# Worker protocol

The engine does not run on the page's main thread. The web app starts it as a module Web Worker, so dragging a slider never blocks the map. The page talks to the worker through a small typed protocol in `packages/engine/src/worker`.

**Where the code lives**

- `packages/engine/src/worker/protocol.ts`: request and response types
- `packages/engine/src/worker/handler.ts`: `createReplayHandler`, the request dispatcher
- `packages/engine/src/worker/client.ts`: `createReplayClient(worker)`, a promise wrapper
- `packages/engine/src/worker/entry.ts`: the worker script, started with `new Worker(new URL("@itza/engine/worker/entry", import.meta.url), { type: "module" })`
- `packages/engine/src/worker/compare.ts`, `compareTypes.ts`: the compare workspace's request and result shapes
- `packages/engine/src/worker/errors.ts`: failure types

## Messages

Every request has a numeric `id`, and the response repeats it, so many requests can be in flight and each one finds its caller.

| `type` | Payload | What it does | Returns |
|---|---|---|---|
| `runReplay` | `ReplayRequest` | Replays the candidate rotations through every usable season with Monte Carlo draws | `EngineOutput` |
| `rescore` | priorities | Re-scores the last replay with new priority weights, without re-simulating | `EngineOutput` |
| `compare` | `CompareRequest` | Builds the compare workspace: ranked rotations and evidence for the farmer's inputs | `CompareResult` |
| `reweigh` | `ReweighRequest` | Re-ranks the compare result under new weights | `Weighted` |
| `timeline` | season label | Season-by-season detail for one season of the chosen rotation | `TimelineResult` |
| `whyNot` | crop id | Explains why a crop was left out of the candidates | `Exclusion` |
| `future` | `FutureRequest` | Runs the 2050 or scenario view | `FutureResult` |
| `design` | `DesignRequest` | Scores a rotation the farmer built by hand in the builder | `DesignResult` |

A response is either `{ id, ok: true, result }` or `{ id, ok: false, error: { name, message } }`. Failures cover bad input, a bad bundle, and an engine result that breaks its own contract.

## Why `rescore` and `reweigh` exist

Re-ranking is the cheap part. The expensive part is the replay with 200 Monte Carlo draws. The priority sliders change only the weights, so the worker keeps the last replay and re-scores it. That is what makes the sliders feel instant.

## Related pages

[Engine overview](01-overview.md) · [Scoring, uncertainty and scenarios](05-scoring-uncertainty-scenarios.md) · [Front-end: web app shell](../04-Front-end/01-web-app-shell.md)
