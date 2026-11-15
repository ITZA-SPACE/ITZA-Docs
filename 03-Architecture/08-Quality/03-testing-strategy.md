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
| Science validation | ET0 vs FAO-56 examples; water balance vs reference; Field Memory vs CDL/farmer labels; ML CV metrics | pytest, notebooks |
| Grounding | Assistant answers contain only tool-sourced numbers | Scripted eval set |
| Generative UI | Every scripted question yields a catalog-valid surface or the predefined fallback; actions allow-listed; visual snapshots of answer surfaces | JSON Schema validator, Vitest, Playwright |
| E2E | Draw field → cards → replay → 2050 → PDF | Playwright |
| Visual / a11y | Visual snapshots, contrast, keyboard | Playwright + axe |
| Performance | Engine timing, fps checks | Benchmarks in CI |
