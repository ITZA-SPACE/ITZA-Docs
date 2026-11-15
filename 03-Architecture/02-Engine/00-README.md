# Engine

The simulation engine (`packages/engine`): physics, replay, scoring, Monte Carlo, Field Memory and the worker that runs it in the browser.

[Back to Architecture](../00-README.md)

## Pages

- [Engine overview](01-overview.md)
- [Worker protocol](02-worker-protocol.md): The engine does not run on the page's main thread. The web app starts it as a module Web Worker, so dragging a slider never blocks the map. The page talks to the worker through a small typed protocol in `packages/engine/src/worker`.
- [Engine module layout](03-module-layout.md): The engine as a set of pure modules, and the order they run in.
- [Core equations](04-core-equations.md): The physics: reference evapotranspiration, crop calendar, water balance, thermal stress and the other processes.
- [Scoring, uncertainty and scenarios](05-scoring-uncertainty-scenarios.md): How eight criteria become one score, how Monte Carlo draws turn it into bands, and how scenarios change the weather.
- [Determinism and validation](06-determinism-and-validation.md): Why the same inputs always give the same answer, and how we check the engine against reference models.
- [Field Memory](07-field-memory.md): How a field's NDVI history becomes seasons, crop labels and an inferred rotation.
