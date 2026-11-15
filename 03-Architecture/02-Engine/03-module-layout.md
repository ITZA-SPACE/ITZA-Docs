# Engine module layout

The engine as a set of pure modules, and the order they run in.

**Where the code lives**

- `packages/engine/src`

---

## Module layout

```
packages/engine/src
  physics/        import from `@itza/engine/physics`
    et0.ts          FAO-56 Penman–Monteith ET0 from canonical weather
    crops.ts        Kc curve, stage calendar, root growth and sowing day per crop (knowledge-pack params)
    soil.ts         texture class, hydrologic group, REW/TEW from the bundle `soil` block
    waterBalance.ts daily root-zone balance, Ks, runoff, deep percolation, bare-soil evaporation, WSI
    thermal.ts      frost/heat events by stage sensitivity, GDD
    forcing.ts      bundle series to daily forcing with ET0 and a documented gap policy
  climate/        Climate Fingerprint (F-04), import from `@itza/engine/climate`
  replay/         Season Replay (F-07), import from `@itza/engine/replay`
    soilHealth.ts   N credit score, residue/root score, canopy and residue ground cover by month
    pests.ts        host-family returns within the break window × weather risk
    erosion.ts      slope × rain intensity × uncovered share of erosive rain
    simulate.ts     rotation × usable season loop over the physics, one parameter draw at a time
    score.ts        criteria, priority→criterion weights, composite and contributions
    resilience.ts   per-rotation distribution metrics, win rate, ranking order
    montecarlo.ts   seeded parameter draws (mulberry32)
    run.ts          `simulateReplay` (simulate nominal + draws) and `scoreReplay` (weights only)
  worker/         Web Worker protocol, handler, client and entry (`@itza/engine/worker`, `/worker/entry`)
  decisions/      Decisions around the replay, import from `@itza/engine/decisions`
    scenarios.ts    slider and preset scenarios applied to the weather record, robustness readout
    projection.ts   2050 delta-change: `/v1/projection` payload to scenarios and score shifts with model spread
    constraints.ts  crop-level hard filters (farmer constraints, frost-free days, temperature range)
    candidates.ts   sequence enumeration with pest break intervals, replay pre-scoring, diversity, `explainExclusion`
    confidence.ts   coverage, scale ratio, model–satellite agreement, trait confidence, ground truth
    evidence.ts     schema-valid evidence cards with gaps, risks and provenance
    templates.ts    plain-English sentence templates
  contracts/      generated types and the Ajv `validate(schemaId, data)` helper (schemas live in /schemas)
```
