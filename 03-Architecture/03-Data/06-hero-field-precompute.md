# Hero-field precompute pipeline

How the four demo fields are built ahead of time and shipped as static bundles.

**Where the code lives**

- `pipelines/build_demo.py`

---

## Hero-field precompute pipeline (#17)

`pipelines/hero_fields.yaml` fixes one Sétif story sampling area and three independently
selected Akron proof areas. `pipelines/build_demo.py` calls science service modules
in-process and builds static schema-validated bundles, terrain/frame/zone assets,
landscape context responses, seasonal stress predictions and independent CDL histories.
Batch context normalizes the published SME2 surface-quality-flag location and preserves
GRACE native solution dates, including distinct solutions in one calendar month;
missing months stay null. Same-date SMAP context comparisons disclose their one-granule
3-hour sampling rather than claiming a full daily mean.
It checkpoints source stages and retains hashed raw public requests for resumption;
publication checks the 5 MB per-field and 150 KB per-PNG budgets before replacement.
The batch reader clips native IMERG, SMAP and HLS windows before the existing adapters
read them, avoiding whole global granule downloads. Spatial HLS is capped at 12 evenly
spaced scenes per collection over two years; provenance/gaps disclose sparse sampling.
Historical forcing remains full-period POWER weather and QA-screened centroid MODIS,
with short-period native server data kept in a separate sidecar. CDL labels never drive
Field Memory; the engine receives the observed NDVI inputs and infers history itself.
The independent uv project has offline unit/smoke tests and a 90% coverage gate, run
explicitly alongside pnpm checks. See [pipeline commands, artifact contracts and limits](https://github.com/ITZA-SPACE/itza/blob/dev/pipelines/README.md#hero-field-bundles-17).
