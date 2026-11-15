# USDA NASS QuickStats in ITZA: full report

Scope: what QuickStats offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, `pipelines/validation/`, shipped data).

Items marked *(from my knowledge)* describe the product as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes QuickStats as county- and state-level agricultural statistics: yields, planted acreage, production history and crop frequency. It suggests using it to calibrate models against historical performance, compare rotation possibilities and explore long-term trends.

## 2. Is it used? Yes, validation only

Not a production input. It is a precomputed comparison reference (issue #105). `sources.json` records it as public domain (US government work), with provider terms applying to API use.

## 3. How we use it

1. **Capture** (`pipelines/validation/capture.py`): the public QuickStats website's **Spreadsheet export** (not the API, so no key). Selection: **Washington County, Colorado (FIPS 08121)**, survey **winter wheat yield** in bushels per harvested acre, all practices, **2008-2025**. Raw CSV, query and URL are kept in `pipelines/validation/data/raw/`. Suppression codes stay missing, and irrigated or other subsets are excluded. Raw captures are reused when both the CSV and URL file exist. Captured 2026-11-14.
2. **Replay counterfactual** (`pipelines/validation/replay.mjs`): the TypeScript engine runs a **fixed continuous winter-wheat replay** on each proof bundle: US Central Great Plains knowledge pack, default soil, equal priority weights, no irrigation, historical weather, seed 42, no Monte Carlo. The export hashes are stored in `data/replay.json`.
3. **Build** (`build.py`, offline): matches the replay's score by the season's harvest year, writes the result to `cross-checks.json`.

## 4. What it is used for

It tests whether the engine's season scores **move with real county yield**:
- 16 annual records, **15 overlap the replay seasons** (2009-2025; 2019 and 2024 are absent from the export, and missing years are not bridged).
- **Spearman 0.597 / 0.592 / 0.592** across the three fields.
- **Direction agreement in 7 of 12** adjacent non-tied year-on-year changes on every field. Tied changes are excluded and counted.
- No bias or RMSE is computed, because scores and yields are unlike units.

## 5. Known limits
- It is a **rank check on a county series**, not a yield forecast, and not a check of the actual field or its rotation.
- The county includes many fields and practices, and dryland and irrigated land.
- All three proof fields share the **same county series** and may share coarse weather pixels, so they are not independent trials.
- Correlation is undefined with fewer than three pairs or a constant series, and no significance is claimed.
- US only, so nothing validates Sétif.

## 6. What could be useful from the rest

1. **Other crops and neighbouring counties**, to see whether the score-yield link holds beyond winter wheat in one county *(from my knowledge on available series)*.
2. **Acreage and crop-frequency history** to cross-check the crop mix that Field Memory infers and the CDL shows.
3. **Irrigated versus non-irrigated yield**, which the capture excludes today, to separate water stress from management.
4. **Dryland-only series** would be a closer match for the no-irrigation replay.

## 7. Open items
- 0.59 is a moderate rank correlation. Decide how it should be described next to the 78% history agreement, so the validation view is read as directional evidence.
