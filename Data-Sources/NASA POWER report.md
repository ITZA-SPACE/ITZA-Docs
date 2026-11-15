# NASA POWER in ITZA: full report

Scope: what NASA POWER offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, shipped hero bundles).

Items marked *(from my knowledge)* describe NASA products as I recall them and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes POWER as accessible solar, meteorological and climatology data (temperature, humidity, radiation and derived indicators) used to estimate crop water use, growing-season conditions, frost risk and climate suitability.

| Product | Resolution | Coverage | Gives | Used? |
|---|---|---|---|---|
| **POWER Daily API v2.10** | about 55 km (manifest) | 1981 to near real time | Daily point weather | **Yes, the weather backbone** |
| **POWER Climatology API** | about 55 km | 2001-2025 normals | 12 monthly normals | **Adapter registered; no consumer found** |
| **POWER Projection data (NEX-GDDP-CMIP6)** | 0.25° cells | 2041-2060 vs 1995-2014 | Monthly climate change factors | **Yes, 2050 mode** |
| **POWER SMAP archive (Zarr)** | about 9 km, regridded | 2016-2025 used | Daily root-zone moisture | **Yes, ML training only** |

No login is needed for any of these.

## 2. How we use it

### The daily adapter (`packages/adapters-browser/src/adapters/power.ts`)
Manifest entry `nasa_power_daily` maps these POWER parameters to canonical variables:

| Canonical | POWER parameter | Unit | Notes |
|---|---|---|---|
| `tmax`, `tmin`, `tmean` | `T2M_MAX`, `T2M_MIN`, `T2M` | °C | |
| `rh` | `RH2M` | % | |
| `wind2m` | `WS2M` | m/s | |
| `srad` | `ALLSKY_SFC_SW_DWN` | MJ/m²/day | converts kW-hr/m²/day by ×3.6 |
| `precip` | `PRECTOTCORR` | mm/day | the rain fallback after IMERG |
| `et_actual` | `EVPTRNS` | mm/day | a proxy: converted from MJ/m²/day by ÷2.45 (latent heat), method `latent_heat_conversion`, quality at most medium |
| `sm_rootzone` | `GWETROOT` | fraction | a wetness index, not volumetric moisture, quality at most low |

### Shipped hero bundles
In `akron-proof-1` and `setif-story`, the series `tmax, tmin, tmean, rh, wind2m, srad, precip` are all `nasa_power_daily`: 2008-01-01 onwards, 6,575 days, none missing. Provenance reads "Nearest regional cell; UTC daily values; no gap interpolation", version `snapshot`, quality medium, resolution 55 km. **So the demo's water balance, frost and heat indicators, and ML features all run on POWER.**

## 3. What it is used for

- **Reference evapotranspiration.** `packages/engine/src/physics/et0.ts` implements FAO-56 Penman-Monteith (daily, Allen et al. 1998) using POWER temperature, wind, radiation and mean RH. `forcing.ts` requires `tmax, tmin, precip, srad, wind2m`, takes elevation from the bundle (it throws without it, and elevation comes from NASADEM), and records gaps.
- **Gap policy.** Temperatures take the nearest valid day, rain is 0 mm, and a day lacking ET0 inputs gets the day-of-year mean ET0. The filled days are counted and lower confidence.
- **FAO-56 water balance.** POWER weather plus rain drive each rotation's daily soil-water depletion, the core of the ranking.
- **Frost and heat.** The arena counts frost days (tmin below 0 °C) and heat days (tmax above 35 °C) per growth stage (`apps/web/src/arena/features.ts`).
- **Climate Fingerprint.** Seasonal and monthly indicators from the same daily forcing.
- **2050 mode.** `services/science-api/.../api/projection.py` serves monthly change factors (additive or multiplicative per variable) for SSP126, SSP245 and SSP370 from six models (`cesm2, ec_earth3, gfdl_esm4, giss_e2_1_g, ipsl_cm6a_lr, mpi_esm1_2_lr`). The baseline comes from precomputed 0.25° NEX-GDDP cell records, because reading the archive per request is not feasible (each daily file is about 245 MB). The web app applies the factors through scenario sliders and the Future step.
- **ML stress model.** POWER weather (MERRA-2, 0.5° × 0.625°, 2001-2025) gives the stage rain, dry spells, Hargreaves ET0, rain-minus-ET0, frost and heat features. POWER's SMAP archive gives the soil-moisture anomaly.

## 4. Known limits
- 55 km is much coarser than a field. The map draws the POWER grid cell.
- In the hero bundles the same POWER record feeds the replay and the checks that claim to test it. The IMERG check compares IMERG with PRISM and explicitly says it is "not the POWER rainfall used by this replay", so **POWER's own rain has no direct validation number in the repo**.
- `EVPTRNS` and `GWETROOT` are proxies, and the app labels them as such.
- The climatology adapter is registered but I found no feature that reads it.

## 5. What could be useful from the rest

1. **Check POWER against PRISM.** The offline PRISM capture already exists (monthly precipitation at the three centroids). Comparing POWER `PRECTOTCORR` with it, and PRISM temperature if added, would validate the forcing the demo actually uses.
2. **Use the climatology** for a simple "this season versus normal" line in the Climate Fingerprint, or drop the adapter. Right now it is dead weight.
3. **More POWER parameters** *(from my knowledge)*, for example growing degree days or soil temperature products, if sowing windows become a criterion.
4. ERA5 could fill weather gaps, but POWER already covers the need (see the ERA5 report).

## 6. Open items
- Run a POWER-versus-PRISM comparison (point 1).
- Decide whether the climatology adapter is worth keeping.
