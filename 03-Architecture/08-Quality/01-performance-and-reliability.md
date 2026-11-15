# Performance and reliability

The budgets we hold ourselves to and how we watch them.

**Where the code lives**

- `apps/web`
- `services/science-api`

---

## Performance budgets

| Item | Budget |
|---|---|
| Initial JS (gzipped, excluding map/3D chunks) | ≤ 300 KB |
| Time to interactive (demo, cached) | ≤ 2.5 s on mid laptop |
| Backtest 10 rotations × 25 seasons + 200 MC draws | ≤ 1 s (Web Worker) |
| Slider re-rank (weights only) | ≤ 100 ms |
| 3D time-lapse | ≥ 30 fps, frames ≤ 150 KB each |
| Demo bundle per field | ≤ 5 MB total |

## Reliability and observability

- **Demo mode:** zero network dependency (bundles, frames, template assistant answers recorded as fallback).
- **Timeouts and fallbacks:** every adapter has timeout, retry with backoff, and fallback chain; failures become gaps, not crashes.
- **Health page:** upstream status (POWER, ORNL, CMR, Earthdata, gateway) shown in a hidden diagnostics panel.
- **Logging:** structured logs in the service; client error boundary with local log export.
