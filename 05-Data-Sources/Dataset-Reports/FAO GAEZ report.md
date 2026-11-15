# FAO Global Agro-Ecological Zones (GAEZ) in ITZA: full report

Scope: what GAEZ offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, knowledge packs, docs).

Items marked *(from my knowledge)* describe the product as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes GAEZ as global agro-climatic suitability layers for dozens of crops, plus soil constraints, water availability, yield potential and land-productivity assessments. It suggests using it to check that proposed rotation crops fit local climate and soil, and to compare rotation scenarios from a global agronomic perspective.

## 2. Is it used? Yes, as evidence only (issue #121)

**GAEZ v5, layer `RES05-SIX30AS`** (all-land crop suitability classes), rainfed, **low input** (`LRLM`), historical **AgERA5 climate 2001-2020**, 30 arc-seconds (about 1 km). License CC BY 4.0 (FAO and IIASA 2025). Accessed 2026-11-14.

## 3. How we use it

- **Extraction.** The team read band 1 of the raster cell containing the **Sétif story-field centroid (5.7295 E, 36.11965 N)** with no interpolation (native row 6465, column 22287), and stored the class in `packages/knowledge/packs/dz-high-plains.yaml`.
- **Validation of the data** (`packages/knowledge/src/validate.ts`, `schema.ts`): story packs must give every crop either `status: available` with an integer class or `status: not_available` with an explanation. A crop class on fallow is rejected.
- **Only the Sétif pack has GAEZ.** The US Great Plains and generic packs have none.

| Story entry | GAEZ crop | Class |
|---|---|---|
| Durum wheat, bread wheat | WHE (generic wheat proxy) | 4, medium |
| Barley | BRL | 5, moderate |
| Oats | OAT | 4, medium |
| Chickpea | CHK | 6, marginal |
| Field pea | PEA (dry pea) | 6, marginal |
| Rapeseed | RSD | 6, marginal |
| Spring sunflower | SFL (generic sunflower proxy) | 6, marginal |
| Irrigated potato | WPO (rainfed comparison only) | 6, marginal |
| Lentil, faba bean | no matching crop in the layer | not available |
| Vetch-oat forage, cover crop, fallow | no single matching crop | not available |

Class scale: 1 very high, 2 high, 3 good, 4 medium, 5 moderate, 6 marginal, 7 very marginal, and so on.

## 4. What it is used for

- On comparison cards (`apps/web/src/compare/GaezEvidence.tsx`, `gaez.ts`) it shows, for crops actually replayed on that card and once each, the suitability class, and for marginal or worse ratings a **"risk needing local review: check this modelled suitability with a local agronomist"**. Source, scale, conditions and the sample location are in a provenance chip.
- `inGaezCell` applies a rating **only if the selected field's centroid falls in the same native cell** as the sampled point. Elsewhere the card shows that no local rating was sampled.

### Rules the project set for itself
- Low-confidence regional context, never a field measurement.
- **Not a score contribution and not a candidate filter.** No scores or candidates change.
- "Low input" is a declared comparison scenario, not a statement about the farmer's management.

## 5. Known limits
- It is a single-cell sample, so it describes only the Sétif story field.
- Wheat and sunflower use generic GAEZ crops, not species-specific ones. Lentil, faba bean, vetch-oat and cover crops have no GAEZ match, so those legume and cover options show "not available".
- GAEZ is modeled climate suitability, not soil or management.
- Nothing for US fields.

## 6. What could be useful from the rest

1. **Sample GAEZ for the Akron proof fields** and add it to the US pack, so the card appears there too.
2. **GAEZ's other layers**, such as yield potential, soil constraints and water-availability indicators, as the challenge text lists *(from my knowledge on the exact layers)*. The project uses only the suitability class.
3. **Higher-input and irrigated scenarios** so the "low input" caveat can be compared against what a farmer actually does.
4. **A candidate pre-filter** is possible, but the project chose against it, so I would not add it.

## 7. Open items
- Decide whether GAEZ should cover the US proof fields too (point 1).
