# ERA5 (ECMWF) in ITZA: full report

Scope: what ERA5 offers, whether ITZA uses it, and what could be useful. Checked against the `itza` repo on `dev` at `ff143b7`: I searched the code, pipelines, knowledge packs and docs.

Items marked *(from my knowledge)* describe the resource as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab (Space Agency Partner Resources, ESA) describes ERA5 as a global reanalysis with hourly temperature, precipitation, wind, humidity, soil temperature and radiation. It suggests using it to fill gaps where weather stations are sparse, analyse long-term trends, build temporal features for models and give continuous climate context to NASA observations.

## 2. Is it used? Not directly

- There is no ERA5 adapter, download or pipeline.
- `docs/CHALLENGE_RULES_2026.md` marks it "Not used (POWER covers the need)".
- It appears only **indirectly**: the **GAEZ suitability layer** in the Sétif knowledge pack is computed by FAO from **AgERA5** (the agro-meteorological ERA5 product) for 2001-2020. The app's copy says "Rainfed, low-input comparison under historical AgERA5 climate", and the pack's source citation names it.

## 3. What ITZA uses for the same job

| Need | What the project uses |
|---|---|
| Daily weather for the water balance and ET0 | NASA POWER (MERRA-2-based), 2008-2025 in the hero bundles |
| Rain | IMERG when loaded live, POWER otherwise |
| Weather gaps | nearest-day temperature fill, 0 mm rain, day-of-year mean ET0 (`forcing.ts`), with the filled days counted |
| Long-term climate trend | POWER's long record, and NEX-GDDP projections for 2050 |
| Soil temperature | none anywhere in the project |

## 4. What it could be used for

1. **Gap filling or a second weather source** for fields where POWER's 55 km grid is poor. ERA5 is about 31 km *(from my knowledge)*, finer than POWER.
2. **Soil temperature**, which the project does not use at all, for sowing and germination windows. SMAP L4 may also carry soil temperature, which would give a second possible source *(from my knowledge; see the SMAP report)*.
3. **Hourly data** for features like frost duration instead of daily minimum.
4. **A cross-check on POWER** where PRISM does not exist (outside the US, including Sétif).

## 5. Why it is not used
- POWER already supplies the daily variables the engine needs, and adding a second weather source means a new adapter, license entry and decision rule for which wins.
- ERA5 would not change the rotation ranking unless soil temperature or hourly data became a criterion.
- It is partner data, so using it would add an ESA credit to the submission.

## 6. Recommendation

Low priority. The one real gap it would fill is a weather cross-check for Sétif, where there is no PRISM equivalent. Otherwise skip.

## 7. Open items
- Decide whether a weather cross-check for Sétif matters. If it does, ERA5 is the natural candidate.
