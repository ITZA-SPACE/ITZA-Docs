# GRACE and GRACE-FO in ITZA: full report

Scope: what GRACE and GRACE-FO offer, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, shipped hero bundles). This resource is not on the challenge's Resources tab, but the challenge Objectives name it.

Items marked *(from my knowledge)* describe NASA products as I recall them and are not confirmed in the repo.

## 1. What NASA offers

GRACE (2002-2017) and GRACE-FO (2018 to now) measure changes in Earth's gravity, which show **regional total water storage** (groundwater, soil water, surface water) at a scale of several hundred kilometres *(from my knowledge)*.

| Product | Resolution | Gives | Used? |
|---|---|---|---|
| **JPL mascon RL06.3** (`TELLUS_GRAC-GRFO_MASCON_CRI_GRID_RL06.3_V4`) | about 300 km effective, 0.5° grid | Liquid-water-equivalent thickness anomaly | **Yes, context only** |
| Other GRACE solutions (spherical harmonic, other mascons) *(from my knowledge)* | similar | Same quantity, different processing | No |

## 2. How we use it

`services/science-api/src/itza_science/context/grace.py`:
- **`read_grace`** opens the mascon file, takes the nearest 0.5° land cell to the field, applies the file's scale factor and converts the thickness unit (`cm` or `m`) to centimetres. It returns monthly anomalies, keeps native solution dates, and leaves missing months null (no interpolation).
- **`trend`** fits an ordinary least-squares line to the observed solutions, and returns a trend in cm per year only if there are **at least 24 solutions spanning more than a year**.

`apps/web/src/context/ContextPanel.tsx` (`GraceCard`) turns the trend into text: **"stable"** if its size is under 0.1 cm/year, otherwise "falling" or "rising" with the number.

### What the shipped bundles contain (296 solutions, 2002-04-17 to 2026-09-16)
- `akron-proof-1`: trend **-0.55 cm/year**.
- `setif-story`: trend **-2.21 cm/year**.

Coverage note: "Regional total water storage, approximately 300 km effective resolution; not field groundwater."

## 3. What it is used for

A regional water-sustainability context card. It tells the farmer whether the surrounding region's total water storage has been falling, which matters for long-term irrigation and drought resilience. It is **not used in scoring**.

## 4. Known limits
- The footprint is far larger than a field. It describes the region and not the field's groundwater, as the card itself says.
- GRACE and GRACE-FO have a gap between the two missions (about 2017-2018) *(from my knowledge)*. The code leaves missing months null and does not interpolate.
- A single regional trend cannot tell a farmer anything about their own aquifer.

## 5. What could be useful from the rest

1. **Nothing at this resolution** beyond the existing card. It is a sustainability signal, not a field input.
2. Possibly show the full 296-point series as a small chart. The card currently shows the latest date and the trend.
3. For irrigation questions, local groundwater and streamflow records (USGS NWIS, see its report) would be the field-scale complement.

## 6. Open items
- Sétif's trend (-2.21 cm/year) is four times Akron's. The card does not explain why, so a reader may over-interpret it. A line saying that regional trends can come from nearby heavily pumped aquifers would help.
