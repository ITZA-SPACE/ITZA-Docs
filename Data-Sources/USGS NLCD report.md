# USGS National Land Cover Database (NLCD) in ITZA: full report

Scope: what NLCD offers, whether ITZA uses it, and what could be useful. Checked against the `itza` repo on `dev` at `ff143b7`: I searched the code, pipelines, fixtures and docs.

Items marked *(from my knowledge)* describe the resource as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes NLCD as 30 m land-cover and land-use classes across multiple decades, covering farmland, pasture, forest, water, wetland and development. It suggests using it to understand landscape features that influence microclimate, water availability, erosion risk and pest dynamics, and to analyse long-term land-cover change and farm vulnerability.

## 2. Is it used? No

- I found no NLCD data in the code. The only occurrence of "nlcd" in the code is a string `"nlcd-sampled background"` in the non-crop category list of `services/science-api/src/itza_science/clients/cdl.py`. That is a label name that can appear in the CDL service's responses, not an NLCD dataset.
- `docs/CHALLENGE_RULES_2026.md` marks NLCD "Not used".

## 3. What ITZA uses for the same job

| Need | What the project uses |
|---|---|
| What is around the field | GEDI tall-vegetation card (context only), HLS NDVI frames, the satellite basemap |
| Crop versus non-crop at the field | CDL classes (US), farmer confirmation (Sétif) |
| Pest dynamics | rotation-based pest-break rules in the knowledge packs (`pestBreakViolations`), with no landscape input |
| Water and erosion context | NASADEM terrain and flow accumulation |

## 4. What it could be used for

1. **A landscape-context card** next to GRACE, GEDI and ECOSTRESS showing nearby wetlands, forest, water and development, and how land cover around the field changed over decades.
2. **Pest and microclimate context**, as the challenge text suggests: neighbouring non-crop cover can host pests or change wind and humidity. The engine's pest logic currently ignores surroundings.
3. **Sanity check for the field itself**: confirm the polygon is cropland, so a mis-drawn boundary over a wetland or development is flagged.

## 5. Why it is not used
- It describes the surroundings and not the rotation, so it would not change the ranking.
- **US only.**
- The context panel already shows three landscape cards, and the project's license register would need a new row.

## 6. Recommendation

Low priority. If added, make it a context card in the same pattern as GEDI, with no scoring role. The field-is-cropland check (point 3) is the most defensible use, since it prevents a silently wrong analysis.

## 7. Open items
- Decide whether a field-is-cropland check belongs in the boundary tool, using NLCD or the CDL already in the project.
