# OpenET in ITZA: full report

Scope: what OpenET offers, what ITZA uses, what for, how, and what else could be useful. Checked against the `itza` repo on `dev` at `ff143b7` (code, docs, `pipelines/validation/`, shipped data).

Items marked *(from my knowledge)* describe the product as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes OpenET as field-scale evapotranspiration for the western US from satellite-driven models. It suggests using it for crop water demand, irrigation timing, water-use efficiency and finding fields under thermal or moisture stress, as a ground-truth-style complement to ECOSTRESS and POWER.

## 2. Is it used? Yes, validation only

Not a production input. It is a precomputed comparison reference (issue #105). The source register records **OpenET Ensemble Monthly ET v2.0**, CC-BY-4.0, citing Melton et al. (2022), JAWRA.

## 3. How we use it

1. **Capture** (`pipelines/validation/capture.py`): needs a free `OPENET_API_KEY` from the process environment (never stored in the repo, browser, command argument or Git). The request is a **monthly polygon mean**, Ensemble ET v2.0, gridMET reference, in mm. OpenET accepts at most 10 years per request, so it asks for 2008-2016 and 2017-2025 and joins the rows. Without a key an existing validated snapshot is kept with its original retrieval date, and if none exists the source is recorded as unavailable. HTTP errors fail the run and never produce invented values. Captured 2026-11-14: **216 months per field**.
2. **Modeled ET** (`replay.mjs`): the engine's FAO-56 timeline for the same fixed winter-wheat plan provides monthly modeled actual ET. The first initialization year and months containing filled weather are omitted.
3. **Compare** (`build.py`, offline): pairs the two monthly series, giving **204 complete pairs per field**.

## 4. What it is used for

It tests whether the engine's modeled actual ET is plausible (ITZA minus OpenET):
- **Spearman 0.685 / 0.771 / 0.785** across the three fields.
- **Bias -3.0 / -5.7 / -2.9 mm per month** (the model is slightly low).
- **RMSE 27.3 / 22.1 / 20.3 mm per month**.

This is the strongest check on the water balance, the core of the ranking, in the whole validation view.

## 5. Known limits
- Both sides are **model estimates**. OpenET's ensemble is satellite-driven and uses gridMET weather, and the replay uses POWER weather, so they are not measured ground truth.
- The comparison uses the fixed continuous winter-wheat counterfactual, not the field's actual crop, which the CDL shows can differ.
- OpenET covers the **western US**, which includes the Colorado proof fields but not Sétif.
- The three fields are close together and not independent.

## 6. What could be useful from the rest

1. **A live OpenET cross-check for US fields**, if the API terms and key handling allow it. Today it is offline.
2. **Compare OpenET with the bundle's `et_actual`** (NLDAS or MODIS ET). That variable is fetched but nothing reads it (see the NLDAS GLDAS report).
3. **OpenET's field-level ET** *(from my knowledge on available layers)* to spot stress years the replay misses, as the challenge text suggests.

## 7. Open items
- Decide whether the validation view should state that the check uses a counterfactual crop and not the real one.
