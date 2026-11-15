# MODIS and VIIRS in ITZA: full report

Scope: what MODIS and VIIRS offer, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, shipped hero bundles).

Items marked *(from my knowledge)* describe NASA products as I recall them and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes MODIS and VIIRS as 250 m to 1 km corrected reflectance, NDVI and vegetation indices, with plant-stress, bare-ground and seasonal-change indicators.

| Product | Resolution | Gives | Used? |
|---|---|---|---|
| **MOD13Q1 v061** | 250 m, 16-day | NDVI and vegetation quality | **Yes** |
| **MCD12Q2 v061** | 500 m, yearly | Phenology dates (green-up, peak, dormancy) | **Adapter exists, not wired into the app** |
| **MOD16A2GF v061** | 500 m, 8-day | Gap-filled actual ET | **Yes, browser fallback** |
| MCD12Q1 land cover | 500 m, yearly | IGBP land classes | Yes, ML training only (cropland mask) |
| VIIRS vegetation products *(from my knowledge)* | 500 m to 1 km | Continuity of the MODIS record | No |

All MODIS products are read through the ORNL DAAC MODIS web service, which needs no login (`data-sources.yaml`: `auth: none`).

## 2. How we use it

### The adapters (`packages/adapters-browser/src/adapters/ornl-modis.ts`)
- **Mod13q1Adapter.** It reads the NDVI band and the VI-quality band for the pixel at the field centroid, in chunks of 10 composites (ORNL's limit) with 4 requests in parallel. It keeps pixels with fill value excluded and MODLAND quality bits 0 or 1 (good or check other QA), then scales to NDVI. Output is a 16-day series with method `point_pixel_qa_masked`. It reports gaps for failed chunks and composites masked as cloudy.
- **Mod16a2gfAdapter.** It reads the 8-day ET band, divides by 8 to a mm/day rate, and expands each composite to daily values.
- **Mcd12q2Adapter.** `fetchPhenology` returns per-year green-up, peak and dormancy dates.

Note the method: the browser adapters take **one native pixel at the field centroid** (`kmAboveBelow=0`, `kmLeftRight=0`). The series is a point sample, not a field mean.

### Two data paths
- **Live loads:** the browser fetches MOD13Q1 and MOD16A2GF directly. For `et_actual` the browser chain is `[ornl_modis_mod16a2gf, nasa_power_daily]`, but the server chain (`nldas_noah`, `gldas_noah`) is tried first.
- **Shipped hero bundles:** the NDVI series is MOD13Q1 over 2008-2025 (382 observations for `akron-proof-1`, 398 for `setif-story`), stored on a daily array with values only on acquisition dates. Provenance says "Single native pixel at field centroid; pixel reliability=0; 16-day composites on acquisition date only; not a field-resolution map".

## 3. What it is used for

- **Field Memory** (`packages/engine/src/memory/`): MOD13Q1 supplies the long NDVI history from 2000, which HLS cannot (HLS starts about 2013). Seasons, labels, bare windows and an inferred rotation come from it. In the hero bundles it is the only NDVI series.
- **Validation view:** Field Memory run on MOD13Q1 NDVI is compared with USDA CDL on the three Akron proof fields: **35 of 45 seasons agree (78%)**, below the PRD's 80% target. Most misses are fallow seasons called crop, which the repo suggests may come from the 250 m pixel catching weeds or a neighbouring field (not tested).
- **ML stress model** (`pipelines/ml/`): the training target is the January-June MOD13Q1 NDVI peak (reliability flag 0 only, at least 6 observations per season, 2001-2025), standardized per pixel. MCD12Q1 cropland (class 12) selects the training pixels.
- **Model arena:** actual NDVI peak per season is the satellite opinion.
- **Map:** the 250 m MODIS pixel footprint is drawn over the field.
- **ET fallback:** MOD16A2GF is the browser source for `et_actual` before POWER's `EVPTRNS`.

### The MCD12Q2 cross-check is not connected
The engine supports a `reference` input: each season's phenology is compared with reference green-up, peak and senescence dates within a 30-day tolerance (`crossCheckToleranceDays: 30`, `crossCheck()` in `seasons.ts`), and `SeasonDetail.tsx` shows a note when they disagree. But `useFieldMemory.ts` and `useProofData.ts` call `analyseFieldMemory` with only `series`, `calendar` and `crops`, and I found no caller of `fetchPhenology`. So in the current app, the MCD12Q2 cross-check never runs. The docs and the earlier summary describing it as in use are ahead of the code.

## 4. Known limits
- A 250 m pixel is larger than most fields, so MODIS NDVI mixes the field with its surroundings.
- The point-pixel sample is sensitive to the pixel chosen.
- MOD16A2GF data in the manifest ends 2025-12-27.

## 5. What could be useful from the rest

1. **Wire in MCD12Q2.** The adapter and the engine's cross-check already exist. The missing step is fetching phenology in the loader and passing `reference` to `analyseFieldMemory`. It would give each inferred season an independent date check.
2. **Area-averaged MODIS instead of a single pixel.** The adapter requests only the centroid pixel. A small window average would reduce the single-pixel noise (a possible cause of the fallow misses).
3. **VIIRS** only matters if MODIS data stops, which is not a concern for this submission.
4. **MODIS land cover or other MODIS bands** *(from my knowledge)*: not needed for the ranking.

## 6. Open items
- Decide whether to wire MCD12Q2 into the app (point 1).
- Test the repo's own hypothesis about the 250 m pixel and fallow misses before blaming the sensor.
