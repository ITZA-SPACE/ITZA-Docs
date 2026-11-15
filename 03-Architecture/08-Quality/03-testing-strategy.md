# Testing strategy

The test layers and what each one guards against.

**Where the code lives**

- `.github/workflows/ci.yml`

---

## Testing strategy

| Level | What | Tools |
|---|---|---|
| Schema | Bundles, packs, cards validate | Ajv (TS), Pydantic/JSON Schema (Py) |
| Engine unit + golden | Equations, simulation, scoring, determinism | Vitest |
| Adapter conformance | Fixture in → canonical series out; provenance present | Vitest, pytest |
| Science validation | ET0 and water balance vs FAO-56 examples; Field Memory vs CDL (validation view); replay vs PRISM, OpenET and county yields (`pipelines/validation/`); ML grouped holdout metrics (`pipelines/ml/MODEL_CARD.md`) | Vitest, pytest |
| Grounding | Assistant answers contain only tool-sourced numbers | Scripted eval set |
| Generative UI | Every scripted question yields a catalog-valid surface or the predefined fallback; actions allow-listed (`services/si-gateway/eval/`) | JSON Schema validator, Vitest |
| E2E, visual and a11y | Draw field → cards → replay → 2050 → PDF; contrast and keyboard | Manual checks (no Playwright or axe suite exists) |
| Performance | Engine timing against the 1 s and 100 ms budgets | `pnpm --filter @itza/engine bench`, run by hand (not in `pnpm test` or CI) |
