# USDA Ag Data Commons in ITZA: full report

Scope: what USDA Ag Data Commons offers, whether ITZA uses it, and what could be useful. Checked against the `itza` repo on `dev` at `ff143b7`: I searched the code, pipelines, fixtures and docs.

Items marked *(from my knowledge)* describe the resource as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes Ag Data Commons as open-access agricultural datasets covering soils, crops, climate, land management, phenology, water quality and ecological conditions. It suggests using it for local crop information, soil-property measurements, management practices and field-level research, so that satellite indicators line up with real farm constraints and rotation practice.

It is a **catalog** of many separate datasets from USDA research programmes (for example long-term experiments), not one product *(from my knowledge)*.

## 2. Is it used? No

- I found no code, pipeline, fixture or dependency that reads Ag Data Commons.
- `docs/NASA_DATA_SOURCES.md` lists it with Web Soil Survey and SSURGO as "candidate US soil/research complements; no adapter claimed by this intake". Of that group only SSURGO has since been built.
- `docs/CHALLENGE_RULES_2026.md` marks it "Not used".

## 3. What ITZA uses instead for the same job

| Need | What the project uses |
|---|---|
| Soil measurements | SSURGO (US) and SoilGrids |
| Crop history ground truth | USDA Cropland Data Layer |
| Yield history | USDA NASS QuickStats (county) |
| Published rotation trial | USDA-ARS Akron long-term rotation study, cited in the docs (`docs/FEATURES.md`, F-22 ranking check) |
| Local experiment data | none |

The Akron long-term rotation study is the one place the project already engages with USDA research data. It is used as a **directional** comparison in the validation view, not as a data feed: the replay ranks wheat-fallow above wheat-millet on all three fields, the opposite of the trial's finding (wheat-millet earned about $1,300 a year more). The view shows that as a disagreement, with likely reasons not yet tested (the replay scores water stress, soil health and erosion, not income).

## 4. What it could be used for

1. **Trial data to test that disagreement.** If the Akron experiment's measured soil water, residue or yield data are on Ag Data Commons, they would let the team test the stated reasons for the mismatch.
2. **Local management practices and phenology**, to check Field Memory's inferred season dates and fallow calls against records.
3. **Soil-property measurements**, to compare with SSURGO's survey averages on a real field.

## 5. Why it is not a drop-in

It needs a specific dataset that matches a proof field's location, crop and years, and each dataset has its own format and license. That makes it a research task and not an adapter.

## 6. Recommendation

Worth a targeted search only for the Akron rotation experiment (point 1), because it could explain the one place the validation view shows disagreement. Otherwise skip.

## 7. Open items
- Search Ag Data Commons for the Akron long-term rotation study's data before deciding.
