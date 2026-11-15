# GEDI in ITZA: full report

Scope: what GEDI offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, shipped hero bundles).

Items marked *(from my knowledge)* describe NASA products as I recall them and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes GEDI as high-resolution laser measurements of forest structure: canopy height, leaf area index and above-ground biomass. It suggests the **Level-4 biomass** products for vegetation density, canopy stress and long-term ecosystem change around farms. It also says GEDI works best over taller vegetation, and that its structural context pairs with SMAP, Landsat and MODIS indicators.

| Product | Resolution | Gives | Used? |
|---|---|---|---|
| **GEDI02_A (L2A) v002** | 25 m footprints | Canopy height (RH98) | **Yes, context only** |
| **GEDI02_B (L2B) v002** | 25 m footprints | Canopy cover fraction | **Yes, context only** |
| GEDI L4 biomass products *(from my knowledge)* | gridded or footprint | Above-ground biomass | No |

## 2. How we use it

`services/science-api/src/itza_science/context/gedi.py` (`read_gedi`):
- opens each beam of the granule,
- keeps footprints with `quality_flag = 1`, `degrade_flag = 0` and `sensitivity` between 0.9 and 1,
- keeps footprints inside a **2 km buffer** around the field (true metric distance on a local azimuthal projection),
- caps the output at 2,000 footprints (`MAX_FOOTPRINTS`),
- reads `rh[:, 98]` for height (L2A) or `cover` (L2B),
- counts footprints that intersect the field (`on_field_count`).

The result feeds the **Landscape context panel** (`ContextPanel.tsx`, `GediCard`). It is **not used in scoring**.

### What the shipped bundles contain
- `setif-story`: status ok, 316 footprints within 2 km, captured 2025-07-02. Mean height **4.2 m**, mean cover **0.065**, **0 footprints on the field itself**. The card's hint says tall returns "may indicate trees, orchards or windbreaks; sparse tracks cannot identify tree rows".
- `akron-proof-1`: status empty, no valid footprints.

Coverage note: "Sparse 25 m footprints within 2 km; not continuous field coverage or a tree-row map."

## 3. What it is used for

A landscape context card: whether there is tall vegetation near the field (trees, orchards, windbreaks), which can affect wind, shade and microclimate. It does not change any score.

## 4. Known limits
- Footprints are sparse tracks, not a map, so they cannot find tree rows.
- Open cropland has little tall vegetation. A mean height of 4.2 m near Sétif is a mix of ground and scattered trees.
- The card shows data from one capture date.

## 5. What could be useful from the rest

1. **L4 biomass**, which the challenge text highlights *(from my knowledge on the product details)*. For cropland it adds little, so it would mainly support a tree-cover or agroforestry story.
2. **Windbreak or shelter detection** from repeated tracks, to estimate wind exposure for the ET0 and erosion terms. This is research-grade and the sparse tracks may not support it.
3. Nothing for the rotation ranking itself. GEDI stays context.

## 6. Open items
- The Akron card is empty. Decide whether to show a clear "no tall vegetation nearby" message instead of an empty state.
