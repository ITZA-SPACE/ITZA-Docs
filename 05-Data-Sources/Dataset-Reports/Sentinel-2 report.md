# ESA Copernicus Sentinel-2 in ITZA: full report

Scope: what Sentinel-2 offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, `THIRD_PARTY_NOTICES.md`, shipped bundles).

Items marked *(from my knowledge)* describe the product as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab (Space Agency Partner Resources, ESA) describes Sentinel-2 as freely accessible 10-20 m multispectral imagery with a high revisit, with bands built for vegetation (red edge, NIR, SWIR). It suggests NDVI/EVI, bare-soil mapping, crop-stress detection and fine-scale monitoring, complementing Landsat and MODIS at field level.

## 2. Is it used? Yes, indirectly, in two ways

There is **no direct Sentinel-2 adapter**. ITZA uses Sentinel-2 through:

### 2.1 HLS (`HLSS30_VI`)
- NASA's HLS product harmonizes Sentinel-2 onto the same 30 m grid as Landsat. `services/science-api/.../adapters/hls_vi.py` tries `HLSL30_VI` (Landsat) first and `HLSS30_VI` (Sentinel-2) second for each day, taking the first granule with a valid field mean. **Sentinel-2 therefore fills the days when no usable Landsat granule exists.**
- The credits tab lists the Sentinel-2 half separately as **ESA partner data**: `apps/web/src/methods/credits.ts` finds the HLSS30 DOI in the manifest citation and adds a row "HLSS30 Sentinel-2 (ESA/Copernicus) via LP DAAC" to the partner group. The challenge requires listing partner data in the References field either way.
- The recorded fixtures include one Sentinel-2 scene (`HLS-VI.S30.T13TFE.2025122T173909.v2.0.NDVI.tif`) beside a Landsat one. HLS as a whole also feeds the Prithvi layer and click-to-field boundary detection ("HLS NDVI behavior").

### 2.2 The satellite basemap
The map and 3D twin use **EOxCloudless 2016**, a cloudless Sentinel-2 mosaic by EOX IT Services, licensed **CC BY 4.0** (`apps/web/src/map/basemaps.ts`, `THIRD_PARTY_NOTICES.md`). The attribution reads "Contains modified Copernicus Sentinel data 2016 & 2017". A test (`basemaps.test.ts`) fails if any later EOX year, which EOX licenses for non-commercial use only (2018 to 2025), is ever requested. This was issue #100.

## 3. What it is used for

- **NDVI history** gets Sentinel-2 observations through HLS, used by Field Memory, zones, the arena and the NDVI frames.
- **Basemap** for drawing and viewing fields.
- **Partner-data credit** in the app and in the submission.

## 4. Known limits
- HLS resamples Sentinel-2 to 30 m, so the 10 m detail and the red-edge bands are not used.
- The 2016 basemap is an old image. Fields may look different today, and the app already says it is a basemap and not a current view.
- In the shipped hero bundles the NDVI series is MODIS, so Sentinel-2 appears only in the frames and layers, not in the time series (see the Landsat HLS report).

## 5. What could be useful from the rest

1. **Direct Sentinel-2 at 10-20 m**, using the red-edge and SWIR bands for finer crop-stress and bare-soil detection, as the challenge text suggests. This needs a new adapter and would add the finest resolution the project has.
2. **A current-year basemap** would need a license that permits it. The project chose the 2016 layer for that reason.
3. **Sentinel-2 imagery as the reference for the boundary tool**, at 10 m instead of 30 m, would sharpen click-to-field outlines.

## 6. Open items
- If a direct Sentinel-2 path is added, give it its own manifest entry, license row and partner credit.
