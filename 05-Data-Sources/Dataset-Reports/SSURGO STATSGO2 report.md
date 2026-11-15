# SSURGO and STATSGO2 in ITZA: full report

Scope: what SSURGO and STATSGO2 offer, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, recorded fixtures, shipped hero bundles).

Items marked *(from my knowledge)* describe the products as I recall them and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes SSURGO (field-scale) and STATSGO2 (regional-scale) as detailed soil attributes: texture, organic matter, drainage class, hydrologic soil group, erosion-risk factors, restrictive layers and water-holding capacity. They are meant for location-specific assessments of soil health, erosion potential, infiltration and crop suitability.

| Product | Scale | Gives | Used? |
|---|---|---|---|
| **SSURGO (via NRCS Soil Data Access)** | survey map polygons | Component and horizon soil properties | **Yes** |
| STATSGO2 | regional, coarse | Same attributes at a much coarser scale | No |
| **SoilGrids (ISRIC, not on the list)** | 250 m global | Predicted properties | **Yes, fallback and non-US fields** |

## 2. How we use it

### The adapter (`services/science-api/src/itza_science/adapters/ssurgo.py`)
1. **Search area.** Only fields fully inside the SSURGO search regions (contiguous US, Alaska, Hawaii) are queried. Others get an info gap "Outside SSURGO search regions; using SoilGrids instead".
2. **Query.** A SQL request to SDA joins map-unit polygons, map units, the legend, survey catalog, components and horizons. It intersects polygons with the field geometry and keeps horizons that overlap 0-100 cm (at most 5,001 rows). The field geometry goes in as numeric WKT from a validated shape, never as user SQL.
3. **Aggregation.** For each polygon-component pair, the weight is the geodesic intersection area times the component percentage. For each property, horizons are thickness-weighted over **0-100 cm**. A component is used only if its horizons cover the full metre (no extrapolation). A property is reported only if it covers **at least 50%** of the field.
4. **Properties:** `clay_pct`, `sand_pct`, `silt_pct`, `om_pct`, `ph` (`ph1to1h2o_r`), and `awc_mm_per_m` (`awc_r` × 1000). `soc_pct` is `om_pct ÷ 1.724`, an approximate conversion rated low confidence. SSURGO values are medium confidence.
5. **Categories.** It also returns the shares of hydrologic soil groups and drainage classes.
6. **Fallback.** Missing properties come from SoilGrids at the field centroid, using five depth intervals (0-5, 5-15, 15-30, 30-60, 60-100 cm) thickness-weighted to 0-100 cm. AWC from SoilGrids is the difference between water content at 33 kPa and 1,500 kPa. Gaps are recorded if SSURGO or SoilGrids is unavailable.

The web loader prefers server SSURGO over any other soil source regardless of which request finishes first (`apps/web/src/data/loader.ts`). `pipelines/refresh_soil.py` refreshes the hero publications and refuses to publish an incomplete soil block.

### What the shipped bundles contain
- `akron-proof-1..3`: SSURGO (clay 22.6, sand 20.3, silt 57.1, OM 0.88%, pH 7.84, AWC 185.9 mm/m for proof-1).
- `setif-story`: SoilGrids (clay 28.6, sand 37.7, silt 33.6, soil carbon 0.62%, pH 7.55, AWC 120.7 mm/m).

## 3. What it is used for

- **Available water capacity** sets soil water storage in the FAO-56 balance (`awcMmPerM` in `physics/soil.ts` and `waterBalance.ts`).
- **Texture class** from clay and sand (USDA texture triangle) picks FAO-56 Table 19 evaporation parameters, and a **hydrologic soil group (A to D)** from texture feeds the SCS runoff curve number.
- **Waterlogging risk** is raised on evidence cards for legumes and brassicas when that group is D.
- **ML feature** `soil_awc_mm_m` (the ML training used SoilGrids water retention).
- **Zones:** a baseline `awc_mm_per_m` and curve number go into the zone soil scenarios.
- **Farmer override:** a farmer-entered soil value wins over both.

## 4. Known limits
- SSURGO is US only, and survey units are averages. The app labels SSURGO as medium confidence.
- If the soil profile is incomplete (missing a depth), that component is skipped and the property can fall back to SoilGrids.
- OM ÷ 1.724 is an approximate conversion.
- **The official hydrologic group is fetched but unused.** The engine derives it from texture (`GROUP[texture]`). On the recorded Akron response the official group is mostly B with a minor C component, and texture gives silt loam, which is B, so they agree there. They could disagree elsewhere.
- STATSGO2 is not used.

## 5. What could be useful from the rest

1. **Wire SSURGO's `hydgrp` into the runoff curve number**, with texture as the fallback. The data is already in the adapter's output.
2. **Drainage class**, also already fetched, for the waterlogging risk instead of inferring it from texture.
3. **More SDA columns** *(from my knowledge)*: erodibility factor (K), restrictive layer depth, available water by horizon. The erosion index currently uses a slope-and-rain proxy and could take a measured soil erodibility.
4. **STATSGO2** is only worth adding as a coarse US fallback where SSURGO has no survey, which is rare.

## 6. Open items
- Decide whether to wire in the official hydrologic group and drainage class (points 1 and 2).
