# NLDAS and GLDAS in ITZA: full report

Scope: what NLDAS and GLDAS offer, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, shipped hero bundles).

Items marked *(from my knowledge)* describe NASA products as I recall them and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes NLDAS and GLDAS as land data assimilation systems combining satellite and ground observations into gridded sub-daily temperature, precipitation, soil moisture, evapotranspiration proxies and radiation. They help study drought onset, moisture deficits and growing-season transitions, and give continuous time series.

| Product | Resolution | Coverage | Gives | Used? |
|---|---|---|---|---|
| **NLDAS Noah (`NLDAS_NOAH0125_H` v2.0)** | 0.125° (about 14 km), hourly | 1979 to now, US | Soil moisture (0-100 cm), ET | **Yes, fallback** |
| **GLDAS Noah (`GLDAS_NOAH025_3H` v2.1)** | 0.25° (about 28 km), 3-hourly | 2000 to now, global | Soil moisture (three layers), ET | **Yes, fallback** |
| Forcing fields (temperature, rain, radiation) from these systems *(from my knowledge)* | same | same | Weather inputs | No |

Implemented in issue #106. The results are **model estimates**, not measurements, and the app labels them so.

## 2. How we use it

### The adapter (`services/science-api/src/itza_science/adapters/gldas.py`)
- A `LandSurfaceReader` searches Earthdata for the field's bounding box and one day at a time (35 granules maximum per day), streams the file, and **clips a small window** rather than downloading the global grid.
- **GLDAS** layers: `SoilMoi0_10cm_inst`, `SoilMoi10_40cm_inst`, `SoilMoi40_100cm_inst` and `Evap_tavg`. **NLDAS** layers: `SoilM_0_100cm` and `Evap`.
- Soil water mass over 0-100 cm is divided by 1000 to give m³/m³. ET uses the native time bounds, and the method string notes that "signed net ET includes condensation". The NLDAS domain is limited to the US box (-125, 25, -67, 53).
- `merge_modeled_fallbacks` (called from `api/bundles.py`) fills gaps in SMAP root-zone moisture, recording source switches in `segments` and `derived_from`. The browser merge adds "includes modeled land-surface estimates" to the method.

### Chains (`data-sources.yaml`)
- `sm_rootzone: [smap_l4, nldas_noah, gldas_noah]`
- `et_actual: [nldas_noah, gldas_noah]`

### What the shipped bundles contain
Each hero bundle has **one day**, 2014-06-01 (chosen as a pre-SMAP day with verified real field clips): `akron-proof-*` from NLDAS (root zone 0.209 m³/m³, ET 2.51 mm/day, 13.9 km), `setif-story` from GLDAS (27.8 km, since NLDAS does not cover Algeria). Quality is low. These sit in `ldas.json` and in the `sm_rootzone` and `et_actual` series.

## 3. What it is used for

- **Root-zone moisture fallback** when SMAP has no data, including dates before SMAP starts (2015-03-31). The values enter the same soil-moisture series used by the Climate Fingerprint anomaly and the model-versus-satellite check, so a long series would mix modeled and measured data. The provenance records which days are modeled.
- **Actual ET** (`et_actual`): fetched into the bundle. **I found no engine or UI code that reads `et_actual`.** The engine computes its own ET from the water balance, and the validation compares that modeled ET with OpenET, not with the bundle's `et_actual`. So today it is stored and shown in provenance, but it does not feed a decision.

## 4. Known limits
- The data are model output, so confidence is low and the evidence cards say so.
- The cells (14 to 28 km) are larger than SMAP's 9 km.
- NLDAS covers only the contiguous US.
- Mixing modeled and observed days in one series means a "satellite agreement" correlation is partly model-versus-model for the modeled stretch.

## 5. What could be useful from the rest

1. **Use `et_actual` somewhere.** The simplest is a second ET check on the water balance, next to OpenET on US fields (where NLDAS exists) and as the only check for Sétif.
2. **Drought-onset indicators** from the model's moisture percentiles, as the challenge text suggests, for the drought-resilience criterion.
3. **A longer NLDAS or GLDAS series in the hero bundles** instead of one day, so the fallback is visible and the model check can run before SMAP starts.
4. NLDAS and GLDAS forcing fields (rain, temperature) could cross-check POWER, but the project already prefers IMERG and POWER for weather.

## 6. Open items
- Decide whether `et_actual` should be wired in or dropped from the bundle.
- A one-day sample proves the adapter works but does not show the fallback behaviour over time.
