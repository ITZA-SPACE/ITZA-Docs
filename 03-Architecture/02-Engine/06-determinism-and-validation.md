# Determinism and validation

Why the same inputs always give the same answer, and how we check the engine against reference models.

**Where the code lives**

- `packages/engine/test`

---

## Determinism and validation

- Pure functions; seeded PRNG; no wall-clock or locale dependence.
- Golden tests: fixed bundles → expected outputs (JSON snapshots).
- Reference checks: ET0 against FAO-56 worked examples (Examples 17 and 18) and the water balance against FAO-56 Example 37, as engine tests. A cross-check against AquaCrop-OSPy was planned and has not been run.
- Property tests: no candidate violates hard constraints; scores in [0,1]; contributions sum to composite.
