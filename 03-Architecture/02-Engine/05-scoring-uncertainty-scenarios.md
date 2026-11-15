# Scoring, uncertainty and scenarios

How eight criteria become one score, how Monte Carlo draws turn it into bands, and how scenarios change the weather.

**Where the code lives**

- `packages/engine/src/replay/score.ts`
- `packages/engine/src/replay/montecarlo.ts`
- `packages/engine/src/decisions/scenarios.ts`

---

## Scoring and resilience

Per rotation R and season y, criteria `f_k(R, y) ∈ [0,1]`: climate fit, water balance, soil nitrogen, organic matter, erosion control, bare-field exposure, pest pressure (inverted), forage/income.

$$
S_y(R) = \sum_k w_k\, f_k(R,y), \qquad \sum_k w_k = 1
$$

Weights from priority sliders (normalized). Resilience profile per R: median S, P10/P90, worst-season S, count of seasons with severe water stress (WSI > threshold), frost/heat hits, **win rate** vs baseline = share of seasons with S_y(R) > S_y(baseline). Headline ranking uses median S with a robustness tie-breaker (P10).

## Uncertainty

- **Parameter Monte Carlo:** 200 seeded draws over Kc (±10%), TAW (±20%), sowing date (±10 days), p (±0.1) → bands on all outputs.
- **Data uncertainty:** gaps and scale mismatch lower confidence.
- **Confidence score:** weighted combination of coverage (share of days with primary-source data), scale ratio (field area vs coarsest critical source), model–satellite agreement (correlation of modeled root-zone depletion with SMAP L4 anomaly; modeled vs observed season timing), trait confidence, ground truth presence → high/medium/low with reasons.

## Scenarios

- **Sliders:** precipitation × (1 + Δp); temperatures + ΔT; ET0 recomputed.
- **2050 delta-change:** monthly factors from NEX-GDDP (2041–2060 vs 1995–2014 model baseline, per SSP, ensemble and per-model spread): additive for temperature, multiplicative for precipitation (capped), applied to observed 2001–2025 daily series → 25 synthetic future seasons → full replay.
