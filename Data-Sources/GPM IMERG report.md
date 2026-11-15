# GPM and IMERG in ITZA: full report

Scope: what NASA's Global Precipitation Measurement (GPM) mission and its IMERG product offer, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, and the shipped hero bundles under `apps/web/public/bundles/`).

Items marked *(from my knowledge)* describe NASA products as I recall them and are not confirmed in the repo.

## 1. What NASA offers

GPM is a NASA and JAXA mission. Its Core Observatory (launched 2014) carries a dual-frequency precipitation radar (DPR) and a microwave imager (GMI), and calibrates a constellation of partner satellites. IMERG (Integrated Multi-satellitE Retrievals for GPM) merges those microwave estimates, infrared data and rain gauges into one gridded rain product *(from my knowledge)*.

| Product | Resolution | Latency | Gives | Used? |
|---|---|---|---|---|
| GPM DPR and GMI swath products *(from my knowledge)* | swath | hours | Instantaneous radar and radiometer rain, phase | No |
| IMERG Early *(from my knowledge)* | 0.1°, 30 min and daily | about 4 h | Fastest rain estimate | No |
| **IMERG Late daily V07 (`GPM_3IMERGDL`)** | 0.1° (about 10 km), daily | about 14 h | Rain for recent days | **Yes, per-day fallback** |
| **IMERG Final daily V07 (`GPM_3IMERGDF`)** | 0.1°, daily, 1998 to now | about 3.5 months | Gauge-corrected research-grade rain | **Yes, primary** |
| **IMERG Final monthly V07 (`GPM_3IMERGM`)** | 0.1°, monthly | months | Monthly rain rates | **Yes, validation only** |
| IMERG half-hourly *(from my knowledge)* | 0.1°, 30 min | varies | Rain timing and intensity inside a day | No |
| Other IMERG layers: error, quality, liquid-phase probability *(from my knowledge)* | 0.1° | same as parent | Uncertainty and rain-versus-snow | No |

The three products we use are confirmed in `data-sources.yaml` and `docs/NASA_DATA_SOURCES.md`. The repo notes that the latest Final granule in CMR was 2025-09-30, and that IMERG Final lags by months.

## 2. What we use

Variable read: `precipitation` in mm/day, converted to the canonical series `precip`. `pipelines/data_store/clip.py` keeps only the precipitation grid.

### Two data paths: live loads and the shipped hero bundles
This distinction decides where IMERG rain really drives the app.

1. **Live path (new fields, science API).** The browser asks the science API for a bundle (capped at 5 years). The server chain is `precip: [gpm_imerg_final_daily, gpm_imerg_late_daily]`, and the browser chain is `[nasa_power_daily]`. When both arrive, `apps/web/src/data/merge.ts` splices daily series in priority order, so IMERG days win and POWER fills the days IMERG lacks. The merge comment itself gives "a short high-priority record, such as 5 years of IMERG, keeps the long POWER record behind it".
2. **Shipped hero bundles (`akron-proof-1..3`, `setif-story`).** In `bundle.json` the `precip` series is **NASA POWER daily, 2008-2025** (6,575 days, `nasa_power_daily`, 55 km). IMERG appears only as a **single native sample day**: in `akron-proof-1/server.json`, `precip` has one value (0.0 mm on 2025-12-31) from `gpm_imerg_late_daily`. The README of the bundles says so ("historical POWER weather ... a one-day native IMERG/SMAP sample"), and the validation pipeline repeats it: "the replay still uses its bundle's POWER weather".

So for the shipped demo and proof fields, the water balance runs on POWER rain. IMERG rain drives the replay only for fields loaded live through the science API.

### How the adapter works (`services/science-api/src/itza_science/adapters/imerg.py`)
- For each day it tries IMERG Final, then IMERG Late.
- It computes an area-weighted mean over the field polygon.
- Source switches are recorded as `segments`, and `derived_from` lists the products used.
- The series is marked high quality. Without Earthdata credentials it returns a gap and does not fail.
- The hero regions read clips from the dataset store first. The store holds Final daily clips for **one day in seven**, 2008-01-01 to 2025-12-31 (`pipelines/data_store/manifest.yaml`). IMERG days not in the store still try the Late product live.

## 3. What it is used for

### Water balance (when IMERG is in the bundle)
- `precip` is the rain forcing for the FAO-56 daily balance (`packages/engine/src/physics/forcing.ts`, `waterBalance.ts`).
- Rain above an initial abstraction becomes runoff through a curve-number formula (`scsRunoff`), and the rest refills the soil. Result: soil-water depletion per rotation, which drives crop water stress.
- A day with no rain observation is filled with 0 mm, and the gap is counted.
- The forcing code does not care whether the series is IMERG or POWER, so the same logic runs on both.

### Climate Fingerprint (`packages/engine/src/climate/indicators.ts`)
- Seasonal rain total and the longest dry spell, plus `precipSourceDays`, which counts how many days came from each source so every seasonal number shows its provenance.
- These indicators help flag the driest seasons for replay.

### Erosion control (`packages/engine/src/replay/erosion.ts`)
- Rain intensity is the 95th percentile of wet-day rain (wet day is 1 mm or more) divided by 30 mm, capped at 1.
- The monthly erosive share is each month's sum of squared daily rain over the year's total.
- Erosion index = slope × intensity × share of erosive rain falling on exposed soil. This feeds `erosion_control`.

### Model arena and ML stress model (`apps/web/src/arena/features.ts`)
- Per growth stage: total rain, `dry_spell_days`, rain minus ET0 balance, plus frost and heat days. These are features for the ML stress model and the rule-engine opinion.
- In the hero bundles the ML drivers come from POWER rain (for example `late_rain_mm` 78.94 and `mid_balance_mm` in `akron-proof-1/ml.json`).

### Validation (`pipelines/validation/`, `apps/web/src/validation/CrossChecks.tsx`)
This is where IMERG is a measured, on-screen result for the proof fields.
- IMERG Final Monthly V07 is compared with PRISM at each Akron proof-field centroid: 213 observed months (2008-01 to 2025-09), 17 complete September-August seasons ending 2009-2025.
- Spearman 0.838 / 0.814 / 0.850; IMERG minus PRISM bias +32.9 / +17.6 / +20.0 mm per season; RMSE 61.7 / 57.4 / 51.5 mm per season.
- Rates in mm/hour are multiplied by exact calendar hours. Missing months stay null and never become zero.
- The three fields share one IMERG cell, so they are not independent sites. IMERG Final and PRISM both use rain gauges and may share observations.
- If a bundle has no IMERG series, the check says "these bundles contain NASA POWER rainfall and no IMERG series. POWER has not been relabeled as IMERG."

### Credits tab
Final is labelled "Daily rain history (research-grade)" and Late "Daily rain for recent days, before the final product is ready".

## 4. Known limits
- A 0.1° cell (about 10 km) is larger than most fields, so IMERG represents the area.
- Final lags by months. Recent rain comes from Late, which is less calibrated. The source for each day is recorded.
- The dataset store has about one day in seven, so other days fall back to a live fetch or become gaps.
- Daily totals hide within-day intensity. The erosion index uses daily rain as a proxy for intensity.
- The server caps a request at 5 years, so live IMERG history is short next to POWER's 1981-onward record.

## 5. What could be useful from the rest

Ranked by value for water efficiency, soil conditions and drought resilience:

1. **Put a multi-year IMERG daily series into the hero bundles.** Right now the demo's replay uses POWER rain. IMERG Final is gauge-corrected and at about 10 km against POWER's 55 km, so it is the stronger rain source. The adapter and store already exist.
2. **IMERG half-hourly rain.** It would replace the daily proxy in the erosion index with real peak intensity, and it would sharpen the runoff estimate in the water balance *(from my knowledge; confirm the exact collection)*. Cost is higher because half-hourly files are large.
3. **IMERG uncertainty and quality fields**, so confidence reflects rain uncertainty and not just the source *(from my knowledge)*.
4. **Liquid-phase probability**, to tell rain from snow in cold regions *(from my knowledge)*.
5. **IMERG Early.** Only worthwhile if the product needs rain within hours. For rotation planning the Late run is enough.
6. **GPM DPR and GMI swath products.** Instantaneous and rarely aligned with a field and date. Little value for rotation planning.

## 6. Open items
- Confirm which IMERG period the live API serves in practice (the code caps requests at 5 years).
- Confirm the variable list of an IMERG V07 daily file by opening `fixtures/earthdata/recorded/3B-DAY.MS.MRG.3IMERG.20250501-S000000-E235959.V07B.nc4`.
- The repo does not document why the other IMERG layers were skipped. The reasons above are my reading of the design.
