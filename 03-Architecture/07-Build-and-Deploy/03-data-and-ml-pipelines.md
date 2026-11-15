# Data and ML pipelines

Batch Python jobs, run with uv by the team or on NVIDIA Brev. Outputs go to the repository or the dataset store. **Brev never serves traffic.**

**Where the code lives**

- `pipelines/`: the base project (`build_demo.py`, `capture_fixtures.py`, `refresh_soil.py`, `refresh_ldas.py`, `refresh_relief.py`, `validate_bundle.py`, `hero_fields.yaml`)
- `pipelines/data_store/`: [dataset store](../03-Data/05-dataset-store.md) sync
- `pipelines/ml/`: stress model data capture and training
- `pipelines/prithvi/`: Prithvi-EO-2.0 experiments, with a Brev job script
- `pipelines/validation/`: validation against independent sources

## The jobs

| Job | Entry point | What it produces |
|---|---|---|
| Hero-field bundles | `build_demo.py` | The four demo fields as static bundles, with USDA CDL histories as independent reference ([details](../03-Data/06-hero-field-precompute.md)) |
| Fixture capture | `capture_fixtures.py` | Recorded real API responses and clipped rasters under `fixtures/`, so tests run offline |
| Soil refresh | `refresh_soil.py` | SSURGO survey properties with SoilGrids fallback |
| GLDAS and NLDAS refresh | `refresh_ldas.py` | Modeled soil moisture and ET context |
| Relief refresh | `refresh_relief.py` | Lidar relief for the 3D twin |
| Bundle validation | `validate_bundle.py` | Checks a bundle against its contract |
| ML training | `ml/train.py` | The regional stress model, with grouped holdout scores and a model card |
| Prithvi | `prithvi/train.py`, `brev.sh` | Experimental crop and fallow classifier |
| Validation | `validation/build.py`, `replay.mjs` | Cross-checks against CDL, PRISM and OpenET |

## Rules

- **Each project is its own locked uv project**, outside the pnpm workspace. Run its checks explicitly in addition to `pnpm check` and `pnpm build`.
- **Offline tests.** Tests use synthetic inputs and recorded NASA granule clips; they do not touch the network.
- **Provenance everywhere.** Every output records its source, version and window.
- **Sampling areas, not boundaries.** The hero fields are sampling polygons selected before looking at historical agreement. They are not cadastral boundaries or identified USDA trial plots.

## Commands

```sh
uv sync --project pipelines --locked
uv run --project pipelines python pipelines/build_demo.py --cache /tmp/itza-demo
uv run --directory pipelines pytest
uv run --directory pipelines mypy
```

## Related pages

[Hero-field precompute](../03-Data/06-hero-field-precompute.md) · [Stress model and arena](../06-AI/01-stress-model-and-arena.md) · [Components: pipelines](../../04-Components/pipelines.md)
