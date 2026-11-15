# CoCoRaHS in ITZA: full report

Scope: what CoCoRaHS offers, whether ITZA uses it, and what could be useful. Checked against the `itza` repo on `dev` at `ff143b7`: I searched the code, pipelines, fixtures and docs.

Items marked *(from my knowledge)* describe the resource as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes CoCoRaHS (Community Collaborative Rain, Hail and Snow Network) as crowd-sourced daily precipitation measurements across North America. It suggests using it to validate satellite rainfall estimates such as IMERG, detect hyper-local extreme-rain events that affect specific fields, and refine models for water stress or irrigation timing.

## 2. Is it used? No

- I found no code, pipeline, fixture or dependency that reads CoCoRaHS.
- `docs/NASA_DATA_SOURCES.md` lists it with PRISM, USGS NWIS and OpenET as needing verification, and `docs/CHALLENGE_RULES_2026.md` marks it "Not used". Of that group only PRISM and OpenET were built (issue #105).

## 3. What ITZA uses for the same job

| Need | What the project uses |
|---|---|
| Check satellite rain against ground rain | PRISM monthly precipitation (a gridded, station-based product) against IMERG Final Monthly, on the three Akron fields |
| Ground rain for a field | none: the shipped replay uses POWER rain, and live loads use IMERG then POWER |
| Local extreme-rain events | none |

The existing rain check has two stated weaknesses: the three fields share one IMERG cell, and **IMERG Final and PRISM both use rain gauges and may share observations**, so their agreement is not fully independent.

## 4. What it could be used for

1. **A true ground-gauge check of IMERG and POWER rain** at or near Akron, to complement the PRISM comparison.
2. **Extreme-rain events.** The erosion index depends on the 95th percentile of wet-day rain and on squared daily rain. Gauge records would show whether 10 km satellite grids smooth out the heavy days that matter for erosion.
3. **Daily rather than monthly comparison.** The PRISM check is monthly. Daily gauge data would test the daily values the water balance actually uses.

## 5. Why it is not a drop-in

It needs a volunteer station close to a proof field with a long, complete record, and the match has to be checked field by field. Individual reports vary in quality and some days are missing *(from my knowledge)*. I could not check what stations exist near Akron from the repo. Also check whether PRISM already ingests the same gauges before presenting CoCoRaHS as independent *(from my knowledge)*.

## 6. Recommendation

Worth a small offline capture for the Akron area, in the same pattern as PRISM and OpenET, if a good station exists. It would add a daily, ground-based rain check. Skip it otherwise.

## 7. Open items
- Search for CoCoRaHS stations within a few kilometres of the three Akron centroids.
