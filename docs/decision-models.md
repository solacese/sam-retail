# Decision and score models

## Choices

Each situation includes an agent, peer, recommendation, triggering family, minimum day, pressure threshold, separate approve and reject actions, an immediate resource delta, and optional operational or delayed effects. The UI's qualitative previews read the same effect payload that the action executor applies. Resource caps can limit the realized change. Exact resource points are intentionally hidden during play; event traces still expose the engine's factual telemetry.

The deterministic recommendation compares both options. Each immediate delta is weighted 3× when the current resource is below 32, 0.3× above 80, and 1× otherwise. A demand-increasing action loses 8 utility points when stock cover is below 90 minutes. The higher utility wins. It is a heuristic, not an optimal policy or an LLM output. Rule confidence is a bounded evidence-strength indicator, not a calibrated probability.

## Delayed and operational effects

- Delivery: additional inventory arrives after two decisions.
- Positive waste risk: after three decisions, some stock spoils based on freshness and incurs additional cash loss.
- Negative waste: clearance improves current freshness and moves stock now.
- Fraud increase: higher ongoing pressure and a confirmed loss after two decisions.
- Promotion: demand rises, the campaign lasts several decisions, and future queues and inventory depletion change.
- Staffing, equipment, loyalty, margin, and supplier delay persist in operational state.

Actions also alter synthetic business reports: negative cash deltas incur 8 currency units of expense per resource point; positive deltas contribute 15 units of revenue and 5 units of profit per point. Resource cash is a liquidity-health index, not a dollar balance. Sales, staffing overhead, and trading margin contribute additional interval profit.

## Score out of 10,000

Let `progress = decisions completed / (30 full or 18 quick)`. Each component is rounded:

| Component         | Maximum | Formula                                                                            |
| ----------------- | ------: | ---------------------------------------------------------------------------------- |
| Survival          |   3,500 | `3500 × progress`                                                                  |
| Balance           |   2,000 | `2000 × clamp((average resources − 0.25 × resource spread) / 80, 0, 1) × progress` |
| Profit            |   1,500 | `1500 × clamp(profit / (2200 full or 1300 quick), 0, 1)`                           |
| Customers         |   1,000 | `1000 × reputation / 100 × progress`                                               |
| Crisis management |   1,000 | `1000 × crises managed / (5 full or 3 quick)`                                      |
| Collaboration     |   1,000 | `1000 × clamp(interventions / total decisions, 0, 1)`                              |

Subtract `65 × stockouts + 50 × fraud incidents + 8 × wasted units`. Clamp the sum to [0, 10000]. A closing crisis counts as managed when its immediate resource utility, weighting resources below 35 twice, is nonnegative. The final report exposes the full score breakdown. Local high scores are separated by game mode.

## Validation

Tests cover replay determinism, rolling-window expiry, complete correlation evidence, causal events, default engine rejection behavior, duplicate-action protection, bounded resources, delayed effects, autonomy limits, six decisions per day, and full/quick completion. A seeded campaign checks strategy viability and content diversity; this is gameplay qualification, not a claim of real retail prediction accuracy.
