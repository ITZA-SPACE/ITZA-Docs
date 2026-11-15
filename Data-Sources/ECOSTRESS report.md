# ECOSTRESS in ITZA: full report

Scope: what ECOSTRESS offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, shipped hero bundles).

Items marked *(from my knowledge)* describe NASA products as I recall them and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes ECOSTRESS as land-surface temperature (LST) and evapotranspiration (ET) at high resolution, useful for finding plant-stress hotspots, heat exposure, shallow-root vulnerability and crop-water demand, and for mapping field-level microclimate. It adds that it is especially useful for spotting when current crops become more vulnerable.

| Product | Resolution | Gives | Used? |
|---|---|---|---|
| **ECO_L2T_LSTE v002** | 70 m | Land-surface temperature and emissivity | **Yes, context only** |
| **ECO_L4T_ESI v002** | 70 m | Evaporative stress index | **Yes, context only** |
| Other ECOSTRESS ET and water-use products *(from my knowledge)* | 70 m | Actual ET estimates | No |

ECOSTRESS flies on the space station, so scenes are **irregular and clear-sky only** (the app's own coverage note says so).

## 2. How we use it

- `services/science-api/src/itza_science/context/service.py` searches the Earthdata archive for the field and returns the **latest 2 matching granules per collection**, with statistics clipped to the field window. `products.py` lists the supported collections and versions.
- The result is served by the context route and shown by the **Landscape context panel** (F-19, `apps/web/src/context/ContextPanel.tsx`, `EcostressCard`), which displays the latest scene's temperature or stress index with its date and provenance.
- It is **not used in scoring**, the ranking, or the evidence-card confidence.

### What the shipped bundles contain
- `akron-proof-1`: status ok, 2 scenes.
  - **LST** on 2026-11-04: mean 275.2 K (about 2.1 °C), range 274.9 to 276.2 K, coverage 1.0.
  - **ESI** on 2026-10-15: mean 0.665, range 0.503 to 0.878, coverage 1.0.
- `setif-story`: status empty (no scenes in the sampled window).

The coverage note on the card reads: "Irregular clear-sky 70 m ECOSTRESS scenes; surface temperature is not air temperature; ESI is actual/potential ET. Latest 2 matching granules per collection; not exhaustive period coverage."

## 3. What it is used for

A context card, shown to help a farmer or judge see current heat and moisture stress near the field. It supports the "within-field microclimate and stress" story but does not change any score.

## 4. Known limits
- Sparse and irregular revisit, so the card often shows one or two scenes and no series.
- A single scene is a snapshot of a moment, not a season.
- Land-surface temperature is not air temperature, so it cannot replace POWER's frost and heat days.
- Only the latest 2 granules are read, not a history.

## 5. What could be useful from the rest

1. **A multi-scene series for the growing season**, to show whether stress rises before a crop's sensitive stages. It needs a larger bounded granule budget and a place to show it.
2. **Compare ESI with the model's water stress.** ESI is actual/potential ET, which is close to what the FAO-56 water balance estimates. Where scenes exist, the agreement could be a second independent check next to SMAP.
3. **Within-field hotspot maps** at 70 m, as the challenge text suggests, would feed the zones. The current code takes field-level statistics only.
4. **Other ECOSTRESS ET products** *(from my knowledge)*, if ESI is not enough.

## 6. Open items
- Decide whether ECOSTRESS should stay a context card or become a check on the water balance (point 2).
- Sétif has no scene in the shipped bundle, so the card is empty for the story field.
