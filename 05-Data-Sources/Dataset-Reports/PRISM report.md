# PRISM Climate Data in ITZA: full report

Scope: what PRISM offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, `pipelines/validation/`, shipped data).

Items marked *(from my knowledge)* describe the product as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes PRISM (Oregon State University) as high-quality US climate data: daily, monthly and 30-year normals for precipitation, temperature, dewpoint, frost/freeze dates and more, with topographic effects built in. It suggests using it to assess long-term trends, align rotation strategies with local temperature and rainfall history, and validate environmental stress indicators derived from NASA satellites.

## 2. Is it used? Yes, validation only

PRISM is **not a production input**. It is a precomputed comparison reference (issue #105). `pipelines/validation/sources.json` registers it with license "freely reproducible and distributable with name, URL and access date attribution".

## 3. How we use it

1. **Capture** (`pipelines/validation/capture.py`, run online, explicit step): PRISM **monthly precipitation** for the 4 km cell at each of the three Akron proof-field centroids, January 2008 to December 2025, SI units, no interpolation. Raw responses are kept in `pipelines/validation/data/raw/akron-proof-N-prism.json`. Captured 2026-11-14: **216 months per field**.
2. **Build** (`pipelines/validation/build.py`, entirely offline): validates the captures, rejects mismatched sources, duplicate dates, invalid units and negative or non-finite values, and writes `apps/web/src/validation/data/cross-checks.json` with SHA-256 digests, resolutions, access dates and paired observations. It refuses stale input if a bundle changes.
3. **Display** (`apps/web/src/validation/CrossChecks.tsx`): shown in the validation view, with bias and RMSE metrics.

No runtime request goes to PRISM. Vite bundles the report.

## 4. What it is used for

It checks **IMERG rain**, the satellite rainfall the live app prefers (see the GPM IMERG report):
- Rain totals use complete **September-August seasons**, labelled by harvest year, and all twelve months are required. **17 seasons ending 2009-2025** pair on every field.
- IMERG Final Monthly V07 rates (mm/hour) are multiplied by the exact hours in each calendar month.
- Results (IMERG minus PRISM): Spearman **0.838 / 0.814 / 0.850**, bias **+32.9 / +17.6 / +20.0 mm per season**, RMSE **61.7 / 57.4 / 51.5 mm per season**. IMERG reads wetter than PRISM on all three fields. Every comparison is shown, including the positive biases.

## 5. Known limits
- The three fields share **one IMERG grid cell**, so they are not independent rainfall sites.
- IMERG Final is gauge-adjusted and PRISM is station-based, so shared gauge observations limit independence.
- The check compares two rainfall products. It does **not** test the POWER rain that the shipped hero replay actually uses ("not the POWER rainfall used by this replay").
- It validates precipitation only. Temperature, dewpoint and frost dates are not captured.
- US only, so nothing validates Sétif.

## 6. What could be useful from the rest

1. **Compare POWER rain with PRISM.** The captures already exist, and the hero bundles run on POWER. This is the most direct missing check.
2. **PRISM temperature** (monthly or daily min and max) to check POWER's `T2M_MIN` and `T2M_MAX`, which drive the frost and heat indicators.
3. **PRISM frost/freeze dates and 30-year normals** *(from my knowledge on availability)* to check the frost-risk calendar and give the Climate Fingerprint a local baseline.
4. **Dewpoint** would check POWER's humidity input to ET0.

## 7. Open items
- Run point 1, since it validates the forcing behind the demo.
- Add a second US validation site if possible, so the rain check is not limited to one grid cell.
