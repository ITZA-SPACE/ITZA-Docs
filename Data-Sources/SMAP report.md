# SMAP in ITZA: full report

Scope: what NASA's Soil Moisture Active Passive (SMAP) mission offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, and the shipped hero bundles under `apps/web/public/bundles/`).

Items marked *(from my knowledge)* describe NASA products as I recall them and are not confirmed in the repo.

SMAP is an L-band satellite that measures soil moisture. Its radar failed in July 2015, so radar products cover only about 2015-04 to 2015-07.

## 1. What NASA offers

| Product | Resolution | Gives | Used? |
|---|---|---|---|
| L1A, L1B, L1C (radar and radiometer) | raw to 36 km | Raw signals | No |
| L2/L3_SM_P | 36 km | Surface moisture from the radiometer | No |
| L2/L3_SM_A | 3 km | Radar moisture, 2015 only | No |
| L2/L3_SM_A/P | 9 km | Radar and radiometer moisture, 2015 only | No |
| L3_F/T_A | 3 km | Freeze/thaw state, 2015 only | No |
| SPL3SMP_E (enhanced) | 9 km | Radiometer surface moisture, 2015 to now | Documented as a fallback only; no adapter found |
| **L4_SM (SPL4SMGP v8)** | **9 km, 3-hourly** | **Surface and root-zone moisture, from a model that assimilates SMAP** | **Yes, the only native SMAP product** |
| L4_C | 9 km | Carbon net ecosystem exchange | No |

One more SMAP-derived source: NASA POWER's SMAP archive (Zarr, no login), used only to train the ML stress model. It is POWER-processed data, not native SMAP.

## 2. What we use: L4 SPL4SMGP

Variables read: `sm_surface` and `sm_rootzone`, in m³/m³. Nothing else from the file is read. `pipelines/data_store/clip.py` keeps only `cell_lat`, `cell_lon`, `Geophysical_Data/sm_surface` and `Geophysical_Data/sm_rootzone`, and the recorded fixture granules in `fixtures/earthdata/recorded/` contain only those fields.

### Two data paths: live loads and the shipped hero bundles
This distinction matters for what the app actually shows.

1. **Live path (new fields, science API).** The browser asks the science API for a bundle (`apps/web/src/data/science.ts`, capped at 5 years). The API runs the SMAP adapter, which needs Earthdata credentials or the dataset store. This is where the full SMAP series, the anomaly and the model check would be computed.
2. **Shipped hero bundles (`akron-proof-1..3`, `setif-story`).** These carry only a **one-day native SMAP sample** from 2025-12-31. In `akron-proof-1/server.json`: `sm_surface` 0.204 and `sm_rootzone` 0.251 m³/m³. In `bundle.json`, `sm_rootzone` spans 2014-06-01 to 2025 (4,232 days) but has only **2 observed values**: one NLDAS (Akron) or GLDAS (Sétif) day on 2014-06-01 and the SMAP day on 2025-12-31. The bundle's own gap says "Native server observations cover only the period in server.json; historical replay uses POWER".

### How the adapter works (`services/science-api/src/itza_science/adapters/smap_l4.py`)
- For each day it finds the day's granules, computes an area-weighted mean over the field polygon on the 9 km cells, then averages the day's 3-hourly samples.
- Days before 2015-03-31 are skipped. A day with no granule becomes a gap.
- If a day has fewer than 8 samples, the series is flagged low confidence and carries the note "daily means include fewer than 8 SMAP samples".
- Without Earthdata credentials the adapter returns a gap and does not fail.
- Each series carries provenance (product, version, resolution, method `area_weighted`).

### The dataset store
For the hero regions (Setif and Akron) the API first reads clips from the shared store (`adapters/dataset_store.py`, `pipelines/data_store/`). The store holds the **first 3-hourly granule of every 15th day**, so a stored day has one sample and is automatically flagged low confidence. Anything outside the stored regions and dates goes to Earthdata live.

### Fallbacks
`data-sources.yaml`: `sm_surface: [smap_l4]`, `sm_rootzone: [smap_l4, nldas_noah, gldas_noah]`. The browser chain adds POWER `GWETROOT`, a wetness index with a different unit (`fraction`), rated low. Source switches are recorded in `segments` and `derived_from`.

## 3. What it is used for

### Root-zone moisture (`sm_rootzone`)

| Use | Where | How |
|---|---|---|
| Season anomaly | Climate Fingerprint, `packages/engine/src/climate/indicators.ts` | Seasonal and monthly means, then a z-score against the other seasons (`soilMoistureZ`). Helps flag the driest years. |
| Satellite opinion | Model arena, `apps/web/src/arena/features.ts` | The anomaly (`smapZ`) is shown next to the rule engine and the ML model, with a provenance chip. |
| ML feature | Stress model | Sent as `smap_rootzone_anomaly` when its absolute value is 20 or less. |
| Model check | `packages/engine/src/decisions/confidence.ts` | Pearson correlation between the model's soil-water depletion and SMAP monthly anomalies, at least 24 shared months. It carries 20% of the confidence label. |

**What this means for the shipped hero fields:** with only two observed values, none of these have enough data. In `akron-proof-1/ml.json` the driver `smap_rootzone_anomaly` has `value: null`. The model-agreement check returns null (it needs 24 months), and the confidence score then counts agreement as neutral and says so. The arena's SMAP line shows "no SMAP" for those seasons. These four uses are real code paths that work when a live load returns a long SMAP series.

### Surface moisture (`sm_surface`)
- A map anomaly layer (`apps/web/src/map/layers/builtin.ts`).
- A same-date value in the context panel (`context/service.py`) next to NISAR scenes, with no nearest-day substitution. In the hero bundles NISAR returned no valid pixels, so this card has nothing to compare.
- The scale warning on evidence cards.

### Scale handling
A 9 km cell is larger than most fields. The map draws the real EASE-Grid 2.0 cell (`map/layers/footprints.ts`). Evidence cards list the gap "SMAP cell is much larger than the field". Confidence drops, and farmer ground truth can override it.

### What SMAP does not do
- It never changes the rotation ranking. If SMAP is missing, the ranking is the same and the confidence is lower.
- I found no engine code that uses `sm_surface` in the ranking. The engine uses only the root-zone series.

### ML training source
`pipelines/ml/enrich.py` uses POWER's SMAP archive (daily RZMC, POWER-regridded L4) to compute a yearly `smap_rootzone_anomaly`. It covers 2016-2025 (the first complete January-June season is 2016). In `pipelines/ml/MODEL_CARD.md`, 3,150 of the 5,085 training rows are missing this feature, and the model handles it through LightGBM's native missing-value path. The archive's own metadata marks the variable status as `reviewing`.

## 4. Known limits
- One 9 km cell is bigger than most fields, so SMAP represents the area, not the field.
- The shipped hero bundles carry one SMAP day, so the SMAP-based features are dormant there.
- The dataset store has about one granule every 15 days, which makes stored daily means single-sample.
- No SMAP product reaches field size. Fine-scale moisture inside a field is a job for NISAR (200 m), which the project already plans for zones. NISAR returned no valid field pixels in the shipped bundles.

## 5. What could be useful from the rest

Ranked by value for water efficiency, soil conditions and drought resilience:

1. **Make SMAP actually present in the demo bundles.** Capture a multi-year SMAP daily series (or at least enough months for a 24-month check) for the hero fields. This does not need a new product: the adapter and the store already exist. It would activate the anomaly, the arena's satellite opinion and the confidence check on the demo fields.
2. **More variables from the L4 file we already clip.** As I recall them, L4 also has soil temperature layers, evapotranspiration, runoff and snow *(from my knowledge)*. The repo's fixtures keep only two variables, so check NSIDC's SPL4SMGP product specification first.
   - Soil temperature could inform sowing windows.
   - Actual ET could cross-check the FAO-56 model.
   - Runoff could feed the erosion criterion.
3. **L3 freeze/thaw (use the 36 km radiometer version for the full history).** It shows whether the ground is frozen, which matters for winter crops. Frost today uses air temperature only.
4. **SPL3SMP_E (enhanced L3).** A real measurement and not model output, so it gives a cleaner independent check on the model. It is documented as a fallback in `docs/NASA_DATA_SOURCES.md` but has no adapter.
5. **L4_C carbon.** Could support a context card. It is a 9 km ecosystem flux, so it is not decision-grade for one field.
6. **Everything else** (L1, the 36 km products, the 2015-only radar products). No use case: too raw, too coarse or too short.

## 6. Open items
- Confirm point 5.2 against NSIDC's product spec or a full L4 granule.
- Decide whether the demo should show SMAP-based anomalies. If yes, point 5.1 is the task.
- The repo does not record why the other SMAP products were skipped. The reasons above are my reading of the design.
