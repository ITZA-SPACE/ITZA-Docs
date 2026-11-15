# USDA AMS Market News in ITZA: full report

Scope: what AMS Market News offers, whether ITZA uses it, and what could be useful. Checked against the `itza` repo on `dev` at `ff143b7`: I searched the code, pipelines, fixtures and docs.

Items marked *(from my knowledge)* describe the resource as I recall it and are not confirmed in the repo.

## 1. What the resource offers

The challenge's Resources tab describes USDA Market News as commodity prices, demand trends and market conditions for crops and livestock. It suggests using it to decide whether proposed rotation crops have a viable local or regional market, which it calls an important farmer-driven constraint.

## 2. Is it used? No, and by design

- I found no code, pipeline, fixture or dependency that reads Market News.
- The economics feature (F-25, `docs/FEATURES.md`) states: "All prices, yields and costs are entered by the user (**no built-in regional defaults: none are sourced**); crops without inputs get no margin. Every margin shows 'indicative proxy, not a forecast'."
- `docs/SOLUTION_OVERVIEW.md` lists "chickpea market price from national average" as an example of an information gap shown to the user.

## 3. What ITZA uses for market viability

| Need | What the project uses |
|---|---|
| Whether a crop has a market | a `market_flag` per crop in each knowledge pack, for example `{ value: true, source: team_estimate, confidence: low }` in the Sétif pack |
| Warning when a crop has no market | the evidence card raises a market risk if `market_flag.value` is false (`decisions/evidence.ts`) |
| Price and margin | farmer-entered prices, costs and reference yields (`@itza/engine/economics`) |

So market viability today is a yes/no flag in the packs. In the Sétif pack the flags are **team estimates** rated low confidence. In the US Great Plains pack they cite the USDA-ARS Akron 2011 study (`ars_akron_2011`) as their source.

## 4. What it could be used for

1. **Back the Sétif `market_flag` values with data.** Market News covers US markets only, so it could not do that. For the US pack it could add current market evidence next to the 2011 study.
2. **Price hints** that prefill the economics form, shown as suggestions the farmer can overwrite.
3. **Demand trends** as context for a crop's market risk.

## 5. Why it is not used
- Prices are local and change quickly. A national or regional series can mislead a farmer whose buyer pays something different.
- It covers **US markets only**, so it does nothing for Sétif.
- The project chose not to ship unsourced defaults, and a hidden default price would be a worse failure than an empty field.

## 6. Recommendation

If added, keep it strictly as an optional suggestion with date and source, never as a score input, and only for the US pack. The current design (farmer enters prices) is the safer default.

## 7. Open items
- The Sétif `market_flag` values are team estimates. Have a local agronomist review them, as the pack's own review note already says. Market News cannot help there.
