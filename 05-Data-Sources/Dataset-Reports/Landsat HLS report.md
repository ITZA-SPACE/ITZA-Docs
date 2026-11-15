# Landsat (through HLS) in ITZA: full report

Scope: what Landsat offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, shipped hero bundles).

Items marked *(from my knowledge)* describe NASA products as I recall them and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes Landsat as 30 m corrected reflectance, NDVI and vegetation indices, with indicators of plant stress, bare ground and seasonal change. It is meant for mapping crop vigor, tracking seasonal transitions, detecting high-stress periods and comparing rotation options visually.

ITZA does not read raw Landsat. It uses NASA's **Harmonized Landsat Sentinel-2 (HLS)** vegetation-index products, which put Landsat 8/9 and ESA's Sentinel-2 on one 30 m grid.

| Product | Source | Gives | Used? |
|---|---|---|---|
| `HLSL30_VI` (Landsat half) | LP DAAC, v2.0 | 30 m NDVI and other VIs | Yes |
| `HLSS30_VI` (Sentinel-2 half) | LP DAAC, v2.0 | 30 m NDVI and other VIs | Yes (credited as ESA partner data) |
| Raw Landsat reflectance, thermal, other indices | USGS or LP DAAC | Full band set *(from my knowledge)* | No |

Manifest entry `hls_vi`: coverage from 2013-04-01 to near real time, 30 m, NASA open data, DOI `10.5067/HLS/HLSL30.002`.

## 2. How we use it

### The adapter (`services/science-api/src/itza_science/adapters/hls_vi.py`)
- For each day it searches `HLSL30_VI`, then `HLSS30_VI`, takes the first granule with a valid mean, and builds a daily NDVI series.
- It reads the native cloud-optimized GeoTIFF window around the field and applies the Fmask quality layer (`geo/qa.py`, `hls_fmask_invalid`). The NDVI and QA grids must match or it raises an error.
- It converts to NDVI (fill value -19999, scale 0.0001) and treats values outside -1 to 1 as invalid.
- It computes an area-weighted mean over the field polygon. A day with at least 50% valid coverage is `observed`, a day below that is `degraded`, and a day with no valid pixel is missing.
- Series quality is medium, method `area_weighted_qa_masked`. Without Earthdata credentials it returns a gap.

### Two data paths: live loads and the shipped hero bundles
- **Live path.** The science API produces the HLS NDVI series for a field (5-year cap).
- **Shipped hero bundles.** In `akron-proof-1/bundle.json` and `setif-story/bundle.json` the NDVI series is **MODIS MOD13Q1** (single native pixel at the centroid, 382 and 398 observations over 2008-2025), not HLS. The bundles list the gap "no clear HLS VI scene in the requested period". HLS appears in the hero bundles only as **NDVI frame images** (`frames.json`: 18 to 19 frames per Akron field, 10 for Sétif), with some dates skipped for "no valid frame pixels".

### How HLS meets MODIS in Field Memory
`packages/engine/src/memory/index.ts` accepts both sensors. It puts them on a common 8-day grid, fits a linear bias correction of MODIS to HLS over their overlap, and prefers HLS where both exist (`hlsGrid.map((v, i) => v ?? modisGrid[i])`). The fit is reported as `biasAdjustment`.

One thing to check: `apps/web/src/data/merge.ts` splices only series that are all `daily`. HLS is daily and MODIS is 16-day, so for live loads the merge keeps the earliest-starting series (MODIS) and drops the other with an info gap. By my reading, that means Field Memory in the live app may receive only MODIS NDVI and not both. I have not run a live load to confirm.

## 3. What it is used for

- **Field Memory** (`packages/engine/src/memory/`): smoothed NDVI is split into agricultural-year seasons and labelled `winter_crop`, `summer_crop`, `double_crop`, `fallow_or_bare` or `uncertain`. Bare windows are found where NDVI is under the region's threshold (default 0.2; 0.25 for the Algerian pack). A rotation (cycle of 1 to 4 seasons that at least 80% of seasons follow) is inferred.
- **Management zones** (`api/zones.py`, `terrain/zoning.py`): yearly 30 m HLS NDVI frames, plus slope and flow accumulation from NASADEM and NISAR moisture where available, are clustered (k-means, 2 to 4 zones, seed 42).
- **Twin time-lapse and NDVI layer**: the draped NDVI frames come from HLS.
- **Model arena**: the actual NDVI peak per season is the satellite opinion and the ML training target (though the ML model is trained on MODIS, see the MODIS report).
- **Prithvi crop/fallow layer** (`pipelines/prithvi/`): HLS bands (blue, green, red, narrow NIR, SWIR1, SWIR2) feed NASA/IBM's Prithvi-EO-2.0. It is experimental, and its README says it fails to distinguish fallow on held-out data and must not be treated as validated rotation history.
- **Click-to-field boundary detection** (F-24) uses HLS and Sentinel-2 imagery.

## 4. Known limits
- A 30 m pixel is the finest vegetation resolution in the project, but revisit is irregular and clouds leave gaps.
- NDVI history is inferred and not a farmer record. The validation view finds 35 of 45 seasons agree with USDA CDL (78%), below the PRD's 80% target, using MODIS NDVI.
- In the shipped bundles, HLS gives frames and the Prithvi layer, but not the NDVI time series.

## 5. What could be useful from the rest

1. **Ship HLS NDVI series in the hero bundles** (not just frames), and resolve the daily-versus-16-day merge so Field Memory gets both sensors. The engine already supports both with bias correction.
2. **Other HLS bands or indices** (SWIR for bare soil and moisture) *(from my knowledge)*. This needs pipeline changes.
3. **Raw Landsat thermal** for field temperature at 100 m resampled to 30 m *(from my knowledge)*. ECOSTRESS covers a similar need at 70 m but with sparse revisit.

## 6. Open items
- Verify the live merge behaviour for NDVI (point under section 2).
- The 78% history agreement is measured on MODIS NDVI. Run it on HLS NDVI to see whether 30 m improves the fallow misses. The repo says the likely cause is the 250 m pixel catching weeds or a neighbour field, and that this is untested.
