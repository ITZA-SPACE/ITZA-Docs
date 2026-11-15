# Field Memory

How a field's NDVI history becomes seasons, crop labels and an inferred rotation.

**Where the code lives**

- `packages/engine/src/memory`

---

## Field Memory algorithm

1. Fetch NDVI series (HLS VI 30 m where available; MOD13Q1 250 m for 2000+); apply QA masks; field-average with pixel-overlap weights.
2. Merge sensors on a common 8-day grid (HLS preferred where both exist; bias-adjust MODIS to HLS over overlap years with linear fit).
3. Smooth (Savitzky–Golay, window 5–7 composites); interpolate gaps ≤ 32 days; flag longer gaps.
4. Segment agricultural years (region start month).
5. Detect phenology: green-up (crossing 20% of seasonal amplitude), peak, senescence (crossing back), bare window (NDVI < threshold ≥ 30 days); cross-check with MCD12Q2 dates.
6. Label seasons by rules on timing/amplitude (winter crop: peak Feb–May; summer crop: peak Jun–Sep; fallow: amplitude < threshold or weedy low peak; uncertain otherwise).
7. Infer rotation pattern (e.g., periodicity of fallow) and propose history; farmer confirmation overrides.
   Implementation: `packages/engine/src/memory`. Observations land in the nearest 8-day cell (at most 4 days off); the MODIS fit is skipped below 6 overlap cells or for a slope outside 0.5 to 2; Savitzky–Golay is quadratic with a 7-cell window (5 optional) shrinking at run ends, and runs shorter than the window use an annual two-harmonic fit over the year around them (other seasons never leak in); a green-up or senescence crossing inside an unfilled gap is left undated. A double crop needs two peaks (≥ 0.4 NDVI, ≥ 60 days apart, trough ≥ 0.15 below both) with one in the winter and one in the summer peak window. The rotation is the shortest cycle (1 to 4 seasons) that ≥ 80 % of labelled seasons follow. `inferred.crop` and `rotation.crops` carry pack crop ids when the caller maps each class to the region's typical crop (NDVI cannot tell species apart); fallow is `fallow` and an unmapped class keeps its class name. Confidence steps down from high for sparse coverage, marginal peaks and MCD12Q2 disagreement (> 30 days).
8. Validation: US control fields against USDA CDL; Algerian fields against farmer-confirmed history.
