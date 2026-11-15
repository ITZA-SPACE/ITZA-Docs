# USFS LANDFIRE in ITZA: full report

Scope: what LANDFIRE offers, whether ITZA uses it, and what could be useful. Checked against the `itza` repo on `dev` at `ff143b7`: I searched the code, pipelines, fixtures and docs.

Items marked *(from my knowledge)* describe the resource as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes LANDFIRE (US Forest Service) as vegetation type, vegetation condition, fuel models and landscape characteristics across the US. It suggests using it to understand local ecosystems, perennial cover, tree-crop interactions, and landscape features that affect microclimate, water flow, erosion and biodiversity relevant to rotational planning.

## 2. Is it used? No

- I found no code, pipeline, fixture or dependency that reads LANDFIRE, and no mention in `docs/` beyond the list of candidates.
- `docs/CHALLENGE_RULES_2026.md` marks it "Not used".

## 3. What ITZA uses for the same job

| Need | What the project uses |
|---|---|
| Perennial or tree cover near the field | GEDI canopy height card (context only) |
| Vegetation type in the field | CDL classes and Field Memory labels |
| Water flow and erosion | NASADEM terrain, flow accumulation, concavity |
| Tree-crop interaction | none: the rotation engine handles annual crops, cover crops and fallow |

## 4. What it could be used for

1. **Perennial and tree-crop context**, if the project ever scored agroforestry or perennial options. The current crop catalogue is annual crops, forage, cover crop and fallow (`potato_irrigated` is the only unusual entry).
2. **Vegetation condition** as a second view of the landscape around a field.
3. **Biodiversity context**, which the challenge mentions and the engine does not score.

## 5. Why it is not used
- It is designed for wildland and fuel management, so most of its layers describe forests and rangeland, not annual cropland.
- **US only.**
- It does not change an annual-rotation ranking.

## 6. Recommendation

Skip for this submission. It becomes relevant only if the product adds perennial or agroforestry options.

## 7. Open items
- None.
