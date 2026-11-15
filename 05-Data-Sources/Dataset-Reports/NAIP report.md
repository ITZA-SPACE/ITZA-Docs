# National Agriculture Imagery Program (NAIP) in ITZA: full report

Scope: what NAIP offers, whether ITZA uses it, and what could be useful. First checked at `dev` commit `ff143b7`; sections 2, 3, 5 and 7 updated for `28259ab` (#157), which added NAIP to the close-up 3D relief.

Items marked *(from my knowledge)* describe the resource as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes NAIP as high-resolution (typically 1 m) aerial imagery captured during the US growing season. It suggests using it to map field boundaries, detect bare-soil periods, observe crop development and land-management changes, and assess vegetation cover at fine scale. It can also train models that need closer-than-satellite detail, or validate patterns seen in NASA data.

NAIP is acquired every few years per state, not continuously *(from my knowledge)*.

## 2. Is it used? Yes, for one view

- Since #157 the close-up 3D relief of a **US** field drapes a NAIP aerial picture, read from the USGS NAIP Plus image service (`services/science-api/src/itza_science/terrain/relief_sources.py`, `UsgsReliefSource`). The demo's Akron fields ship it under `assets/relief/`. Outside the US, the EOxCloudless 2016 mosaic is used instead.
- It is a picture only: no code reads NAIP pixels for boundaries, Field Memory or the ranking.
- `docs/CHALLENGE_RULES_2026.md` now lists it as used for the relief picture (updated 2026-11-15).

## 3. What ITZA uses for the same job

| Need | What the project uses |
|---|---|
| Field boundary | The user draws it, or click-to-field (F-24, `services/science-api/.../api/boundaries.py`) proposes one "from HLS NDVI behavior" at 30 m |
| Check boundary quality | `geo/evaluation.py` scores proposals against **hand-drawn reference outlines** by intersection over union |
| Bare soil periods | NDVI under a threshold in Field Memory, at 250 m (MODIS) or 30 m (HLS) |
| Visual field check | HLS NDVI frames, the EOxCloudless 2016 basemap, and NAIP on the US close-up relief |

## 4. What it could be used for

1. **Better reference outlines for the boundary tool.** The click-to-field evaluation compares against hand-drawn outlines. NAIP at 1 m would make those outlines more accurate for US fields, so the tool's accuracy numbers would be more trustworthy.
2. **Visual validation of fallow calls.** The history check finds 9 fallow seasons called crop. A 1 m image from a known year could show whether a 250 m pixel was catching weeds or a neighbour field, which the repo lists as an untested explanation.
3. **A fine-scale base layer** in the twin for US fields.

## 5. Why it is not used more
- **US only**, so it cannot help the Sétif story field, and ITZA's design treats the two fields alike wherever possible.
- It is not a time series, so it cannot feed Field Memory.
- It is not on NASA's Earthdata, so it needs a different access and license path, which adds third-party license work for the credits tab.

## 6. Recommendation

Useful for improving boundary-tool evaluation and for one-off visual checks on the Akron fields. Low priority for the ranking itself.

## 7. Open items
- Done 2026-11-15: NAIP and USGS 3DEP are listed in `THIRD_PARTY_NOTICES.md` and `submission/references.md` (public domain).
