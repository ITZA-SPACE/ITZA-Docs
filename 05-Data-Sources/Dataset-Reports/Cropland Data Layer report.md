# USDA Cropland Data Layer (CDL) in ITZA: full report

Scope: what the CDL offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, shipped hero bundles).

Items marked *(from my knowledge)* describe the product as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes the CDL (served through CropScape) as annual, 30 m US cropland classification that identifies crops such as corn, soybeans, cotton, wheat and alfalfa. It suggests using it to examine existing rotations, track changes across seasons, find bare fields, and compare local cropping patterns with NASA observations. It can also supply labeled land-cover inputs for models.

## 2. How we use it

The CDL is used as **independent ground truth**, not as an input to the rotation inference.

### Two retrieval paths
1. **Hero pipeline (the one that matters).** `pipelines/build_demo.py` calls USDA's `CDL_WM/ImageServer/exportImage` REST service (`pdi.scinet.usda.gov`) for each season, as a **nearest-neighbor 30 m categorical export**. For each polygon it counts pixels per CDL class and records the modal class as `crop`, `fallow` or `other`, with ties marked mixed. Proof fields require **at least 15 observed CDL seasons**. Results are stored as `cdl.json` in each hero bundle, with provenance and hashes. The note reads: "CDL is a remote-sensing reference label, not farmer-confirmed truth". For Sétif the pipeline records "CDL does not cover Algeria; farmer confirmation required".
2. **CropScape point client** (`services/science-api/src/itza_science/clients/cdl.py`). It queries one point per year, classifies the category as crop, fallow (`fallow/idle cropland`) or other, and is covered by unit tests. **I found no code that calls it outside tests**, so it is not in the live data path. The repo's docs note the CropScape point service was failing on 2026-11-12.

### What the shipped bundles contain
`akron-proof-1..3`: CDL labels for **2008-2023 (16 seasons)**. `setif-story`: none.

## 3. What it is used for

- **Validation view, history check** (F-22, `apps/web/src/validation/proofHistory.ts` and `HistoryCheck.tsx`). Field Memory is run on each bundle's MODIS NDVI and each season is compared with the CDL class (a CDL year maps to the season ending in it, so 2021 is season 2020-21). Result across the three fields: **35 of 45 comparable seasons agree (78%), below the PRD's 80% target**: 29 crop/crop, 6 fallow/fallow, 9 crop called where the record says fallow, 1 the reverse. 2007-08 has no satellite data, and seasons where Field Memory is unsure or the record is mixed are listed as not compared. The method was not tuned to the target. Most misses are fallow seasons called crop, and the repo's untested explanation is that the 250 m pixel catches weeds or a neighbouring field.
- **Ground truth for the Prithvi crop/fallow layer.** `pipelines/prithvi/` trains on the official **2022 HLS/CDL crop dataset** (not on the hero fields), mapping CDL codes to crop (3, 4, 8, 9, 11, 12) and fallow (10). Measured on held-out tiles: accuracy 79.9%, which equals the all-crop baseline, with **fallow IoU 0**. The model never predicts fallow, and its README says not to treat it as validated rotation history.
- **Class names.** `proofHistory.ts` maps common Great Plains CDL codes (for example 24 winter wheat, 61 fallow) to readable names.

## 4. Known limits
- The CDL is a satellite classification, not a farmer log. The app says so wherever it is shown.
- US only, so it cannot validate the Sétif story field. Farmer confirmation stands in there.
- The CDL and Field Memory both use satellite imagery, so agreement is not fully independent.
- The CDL's own accuracy for fallow is lower than for major crops *(from my knowledge)*, which may account for part of the 78%.

## 5. What could be useful from the rest

1. **Compare with HLS-based Field Memory.** The 78% was measured with MODIS NDVI (250 m). Running the same check on 30 m HLS NDVI would test the weed or neighbouring-field hypothesis.
2. **Use CDL crop identity.** Field Memory only distinguishes winter crop, summer crop, double crop and fallow, and maps those to a regional "typical crop". CDL gives the actual crop (for example winter wheat, millet) per year on US fields. It could confirm or correct the crop name that Field Memory assigns, and provide the real rotation for the ranking check.
3. **More seasons.** 2024 and 2025 are not in `cdl.json`, so the latest seasons are not validated.
4. **Remove the unused point client** or wire it in, so there is one retrieval path.

## 6. Open items
- Decide whether to keep `clients/cdl.py`.
- The 78% versus 80% gap is documented but not yet explained.
