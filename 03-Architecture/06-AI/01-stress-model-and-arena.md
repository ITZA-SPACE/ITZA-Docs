# Stress model and Model Arena

The LightGBM stress model, its explanations, and how three opinions are compared.

**Where the code lives**

- `pipelines/ml`
- `services/science-api/models`
- `apps/web/src/arena`

The measured holdout scores, training data and limitations are in the [model card](../../06-Machine-Learning/MODEL_CARD.md).

---

## ML stress model (Model Arena)

- **Target:** seasonal NDVI peak anomaly (z-score vs pixel/field climatology) for cropped seasons.
- **Features:** stage-aggregated rain, dry-spell length, ET0, rain − ET0, frost/heat days, SMAP root-zone anomaly, previous-season state, soil AWC, slope.
- **Data:** thousands of field/pixel-seasons sampled across the region (MODIS 250 m pixels classified as cropland), 2001–2025.
- **Model:** LightGBM with spatial-block and leave-one-year-out cross-validation; SHAP values for explanations.
- **Use:** an independent "statistical opinion" of how stressful a season was; disagreements with the rule engine and with observed NDVI become review flags.
- **Model card:** data, period, metrics, limits (irrigation confounding, mixed pixels).

**Implementation (#16).** [`pipelines/ml/README.md`](https://github.com/ITZA-SPACE/itza/blob/dev/pipelines/ml/README.md) documents
public MODIS/POWER capture, authenticated NASADEM enrichment, SoilGrids WCS AWC,
and the public POWER SMAP Zarr archive. The seeded CPU pipeline ships its compact
model and grouped holdout metrics under `services/science-api/models/stress-v1/`;
[`MODEL_CARD.md`](https://github.com/ITZA-SPACE/itza/blob/dev/pipelines/ml/MODEL_CARD.md) records the measured snapshot and limits.
Calendar stages approximate winter cereals; the fixed retrospective NDVI climatology
includes held-out years, so scores describe reconstruction rather than future forecasting.
`POST /v1/ml/stress` accepts four stage feature objects plus optional SMAP anomaly,
previous NDVI peak, AWC and slope, accompanied by source/resolution/period provenance.
The response includes an NDVI anomaly z-score, expected value, additive TreeSHAP
contributions sorted by magnitude, model version, limitations and missing-feature names.
Inputs are finite, bounded and reject unknown fields (422). `ITZA_ML_MODEL_DIR`
selects a trusted local artifact directory; absent, malformed or fixture artifacts return
503. Successful model loads are cached until restart; no request triggers training.

**Model Arena view (#38).** `apps/web/src/arena/` builds each season's stage features in the browser from the
bundle's daily weather (January to June of the harvest year, 46-day stages, as in training) and calls
`POST /v1/ml/stress` once per season. Rule-engine stress is 1 minus the baseline rotation's `water_balance`
score; the observed opinion is the field's own NDVI peak z-score (needs 3+ seasons). Each opinion maps to
normal / some / strong stress (rule: 0.35 and 0.6; z-scores: -0.4 and -1). Agreement is 1 minus the mean level
gap over opinion pairs; a flag is raised when one opinion says strong stress and another normal. The three most
recent flags go to `CompareRequest.arenaDisagreements` and become risks on every evidence card.
