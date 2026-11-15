# Determinism and validation

Why the same inputs always give the same answer, and how we check the engine against reference models.

**Where the code lives**

- `packages/engine/test`

---

## Determinism and validation

- Pure functions; seeded PRNG; no wall-clock or locale dependence.
- Golden tests: fixed bundles → expected outputs (JSON snapshots).
- Reference checks: ET0 against FAO-56 worked examples; water balance against a Python reference notebook and AquaCrop-OSPy on test fields (tolerance documented).
- Property tests: no candidate violates hard constraints; scores in [0,1]; contributions sum to composite.
