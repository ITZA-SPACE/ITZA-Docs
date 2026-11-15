# SRTM (through NASADEM) in ITZA: full report

Scope: what SRTM offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, shipped hero bundles).

Items marked *(from my knowledge)* describe NASA products as I recall them and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes SRTM as global elevation data for slope, runoff, erosion risk, water flow and terrain-driven stress, helping decide which rotation crops improve infiltration, reduce erosion or stabilize soil on slopes.

| Product | Resolution | Gives | Used? |
|---|---|---|---|
| **NASADEM_HGT v001** | 30 m | NASA's reprocessed SRTM elevation | **Yes, primary** |
| **SRTMGL1 v003** | 30 m | Original SRTM 1 arc-second | **Yes, fallback tile** |
| USGS 3DEP lidar elevation (US only) | about 1 m | Finer elevation | **Yes, close-up 3D relief view only** (since #157; `terrain/relief_sources.py`). Outside the US the relief falls back to 30 m AWS Terrarium tiles. It does not feed slope or the engine |

The data is a static snapshot from the shuttle mission of 2000-02-11 to 2000-02-22, so terrain is not time-varying in the app.

## 2. How we use it

### Reading the DEM (`services/science-api/src/itza_science/terrain/sources.py`, `grid.py`)
- It tries `NASADEM_HGT` v001 first, then `SRTMGL1` v003, for the tiles covering the field.
- It builds a **bounded, aligned 30 m projected grid** over the field. `SpatialLimitError` stops an oversized request. The module notes that "no finer native resolution is implied".
- It bilinearly resamples, uses EGM96 orthometric height, and caches derived assets (`terrain/service.py`, `FileCache`).

### Terrain derivatives (`terrain/derivatives.py`)
From the DEM it computes, on a metric grid:
- **slope** (degrees, from the elevation gradient) and **aspect**,
- **unfilled D8 flow routing** and **flow accumulation** (downstream cell and upstream area),
- **slope classes**: 0-2, 2-5, 5-10 and over 10 degrees,
- **concavity** (cell elevation minus the 5×5 local mean, a 5-cell topographic position),
- **flow lines** as geometry.

### In the bundle
Every field bundle carries static `elevation` and `slope` series with provenance `nasadem_hgt`. In `akron-proof-1`: elevation 1,400.5 m and mean slope 2.09°. `terrain.json` and PNG previews (`slope_class`, `concavity`, `accumulation`) are shipped as static assets.

## 3. What it is used for

- **ET0 needs elevation.** `packages/engine/src/physics/forcing.ts` throws a `RangeError` if the bundle lacks elevation, because FAO-56 Penman-Monteith uses it for pressure.
- **Erosion control criterion.** `run.ts` passes `bundle.field.slope_mean_deg` as `slopeDeg`. `erosion.ts` turns it into a RUSLE-style slope factor (polynomial, capped at 10% slope), and the erosion index is slope × rain intensity × share of erosive rain on exposed soil. That index becomes `erosion_control` in the rotation scores.
- **Management zones** (`terrain/zoning.py`, `api/zones.py`): k-means (2 to 4 zones) on annual NDVI means plus slope and `log1p(flow accumulation)`, with moisture added where available. Each zone gets a **soil scenario** from a Williams (1995) slope adjustment of curve number and water capacity (SWAT 2005, eq. 2.1.1.12), labelled "model scenario, not measured zone soil" with confidence low.
- **Zone back-test** (`apps/web/src/zones/backtest.ts`): the replay is rerun with one zone's slope and soil water, so the spread across zones shows terrain and not crop choice.
- **3D Field Twin** (`apps/web/src/twin/`): terrain, camera presets, and overlays for flow, slope classes, frost pockets and zones.
- **ML feature** `slope_deg`: the model card says slope is sampled at each MODIS pixel center from the reprojected local 30 m gradient, not averaged over a field.

## 4. Known limits
- 30 m resolution is fine for slope but too coarse for micro-relief in small fields.
- Slope is a field mean in the engine, so within-field slope differences matter only through zones.
- The elevation is from year 2000, so recent earthwork or terracing would not show.

## 5. What could be useful from the rest

1. **Use the derived terrain more in the ranking.** Concavity and flow accumulation are computed but, as far as I found, feed only zones and the twin. A wetness-type index from slope and accumulation could improve the runoff and water-collection part of the water balance *(from my knowledge)*.
2. **Aspect.** It is computed but I found no consumer. It could inform frost pockets or heat load on slopes.
3. **Use the lidar heights beyond the relief view.** Since #157 the close-up relief reads USGS 3DEP lidar for US fields, but slope, zones and the engine still use 30 m NASADEM. Deriving slope from 3DEP on US fields would sharpen erosion and runoff there; it stays US-only.

## 6. Open items
- Check what the frost-pocket overlay in the twin actually uses (concavity, aspect, or both).
- The ML slope is a single pixel center, which differs from the engine's field-mean slope. Decide whether to align them.
