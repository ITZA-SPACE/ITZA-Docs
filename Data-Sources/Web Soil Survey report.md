# Web Soil Survey (WSS) in ITZA: full report

Scope: what Web Soil Survey offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, recorded fixtures, shipped hero bundles).

Items marked *(from my knowledge)* describe the resource as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes WSS (maintained by USDA NRCS) as the official US soil source: detailed soil maps and properties, drainage classifications, erosion risk, hydrologic ratings and suitability for different land uses. It suggests using it for field-specific properties such as organic matter, texture, infiltration and compaction risk, to make rotation recommendations locally accurate.

WSS itself is a **web portal** for browsing and downloading the NRCS soil survey. The same tabular data sits behind NRCS's **Soil Data Access (SDA)** web service, which a program can query.

## 2. Is it used? Indirectly, through the same data

ITZA does not call the WSS portal. It reads the **same SSURGO data through SDA**: `https://sdmdataaccess.sc.egov.usda.gov/Tabular/post.rest` (`services/science-api/src/itza_science/adapters/ssurgo.py`). Everything about how that works is in the **SSURGO STATSGO2 report**. This file covers what is specific to the WSS question.

`docs/NASA_DATA_SOURCES.md` still lists WSS and SSURGO as "candidate US soil/research complements; no adapter claimed by this intake". The adapter has since been built (issue #104), so that line is out of date.

## 3. What reaches the app

For the three Akron proof areas, the shipped hero bundles carry SSURGO soil (`soil.json`, `bundle.json`). For `akron-proof-1`:

| Property | Value | Source | Confidence |
|---|---|---|---|
| clay | 22.6% | ssurgo | medium |
| sand | 20.3% | ssurgo | medium |
| silt | 57.1% | ssurgo | medium |
| organic matter | 0.88% | ssurgo | medium |
| pH | 7.84 | ssurgo | medium |
| available water capacity | 185.9 mm/m | ssurgo | medium |
| soil organic carbon | 0.51% (OM ÷ 1.724) | ssurgo | low |

A recorded SDA response, its SQL, retrieval time and SHA-256 live in `fixtures/ssurgo/` (`akron-proof-1.json`, `request.json`), so tests never call the network. That recorded response covers survey area `CO121`, with components mostly in hydrologic group B and one component (5%) in group C, all "Well drained".

## 4. What it is used for

- **Water storage.** `awc_mm_per_m` sets how much water the soil holds in the FAO-56 balance, and so each rotation's water stress.
- **Texture and runoff.** The engine turns clay and sand into a USDA texture class (`physics/soil.ts`), which sets evaporation parameters (FAO-56 Table 19) and a hydrologic group for the runoff curve number.
- **ML feature** `soil_awc_mm_m`.
- **Evidence cards:** a waterlogging risk is shown for legumes and brassicas when the hydrologic group is D (`decisions/evidence.ts`).
- **Farmer override.** The soil form (`apps/web/src/inputs/soil.ts`) lets a farmer enter clay, sand, soil carbon, pH, available water and depth, which win over satellite and survey values.

## 5. Known limits
- US only. For Sétif the project uses SoilGrids (clay 28.6%, sand 37.7%, silt 33.6%, AWC 120.7 mm/m).
- WSS and SSURGO give survey map-unit averages. A field's soil can differ inside a unit.
- WSS offers erosion-risk ratings, drainage and compaction ratings that the app does not read (see below).

## 6. What could be useful from the rest

1. **Official hydrologic group and drainage class.** The SDA query already fetches them (`hydgrp`, `drainagecl`) and the adapter aggregates them into area-weighted shares, but **no consumer reads them**. The engine derives the hydrologic group from texture instead. On the recorded Akron data the texture-derived group (silt loam gives B) agrees with the official B, but the official value would be the better source.
2. **Other WSS ratings**, such as erosion factors (K factor), restrictive layers and compaction risk *(from my knowledge)*, would need new SDA columns and a place to use them. The erosion index could use a measured soil erodibility factor in place of its slope-and-rain proxy.

## 7. Open items
- Update the "no adapter" line in `docs/NASA_DATA_SOURCES.md`.
- Decide whether to wire `hydgrp` into the runoff curve number (point 1).
