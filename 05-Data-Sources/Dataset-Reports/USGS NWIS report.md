# USGS National Water Information System (NWIS) in ITZA: full report

Scope: what NWIS offers, whether ITZA uses it, and what could be useful. Checked against the `itza` repo on `dev` at `ff143b7`: I searched the code, pipelines, fixtures and docs.

Items marked *(from my knowledge)* describe the resource as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes NWIS as long-term records of groundwater levels, streamflow, river stages and water quality. It suggests using it to assess water availability for irrigation, find hydrologic stress, understand downstream erosion risk, and compare NASA-observed moisture with in-situ observations.

## 2. Is it used? No

- I found no code, pipeline, fixture or dependency that reads NWIS.
- `docs/NASA_DATA_SOURCES.md` lists it among sources that "need verification", and `docs/CHALLENGE_RULES_2026.md` marks it "Not used".

## 3. What ITZA uses for the same job

| Need | What the project uses |
|---|---|
| Regional water sustainability | GRACE/GRACE-FO total water storage trend (context card only) |
| Soil moisture against in-situ | none (SMAP is checked against the model, not against ground sensors) |
| Irrigation water availability | none: irrigation is a crop property (`requires_irrigation`) and an input choice, not a supply check |
| Downstream erosion | none |

The knowledge packs include an irrigated crop (`potato_irrigated`, with `requires_irrigation: true`), so the engine can replay irrigated options, but nothing checks whether water would actually be available.

## 4. What it could be used for

1. **Groundwater levels near a proof field** to ground the GRACE card. GRACE says "regional storage is falling" at about 300 km. A nearby well record would show whether the field's own aquifer is falling.
2. **Irrigation feasibility** for the irrigated rotation options: a falling water table is a real risk for a recommendation that depends on pumping.
3. **Streamflow** as an independent drought indicator to compare against SMAP and the soil-moisture anomaly.

## 5. Why it is not used
- The ranking does not model water supply, only crop water demand against rain and soil storage.
- NWIS is **US only**, so it cannot help the Sétif story field.
- It needs a station within a useful distance of each field *(from my knowledge: not all areas have one)*.

## 6. Recommendation

Low priority. It would be a context card next to GRACE, not a scoring input. Only worth doing if the irrigated options become a feature the demo shows.

## 7. Open items
- Check for USGS wells and gauges near the Akron proof fields before deciding.
