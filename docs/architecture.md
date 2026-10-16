# Store simulation architecture

The flagship is authoritative in one browser-local `StoreState`. `advance(state, dt)` mutates it in deterministic fixed steps. A seeded generator controls shopping-list choices. `useSimulation` owns the state reference, playback state and 100ms UI snapshots. The renderer reads the same reference and interpolates people at display refresh rate. Each human keeps a stable initial transform so React snapshots do not snap its interpolated position back to the fixed-step coordinates. Walking cadence follows rendered distance.

- `src/simulation/store.ts`: typed products, batches, people, tasks, transactions, recommendations, events, pathfinding and calculations.
- `src/simulation/useSimulation.ts`: fixed-step lifecycle, overlay pause, speed, decisions and reset.
- `src/shop/StoreScene.tsx`: orthographic Three.js world, stock instances, animated people, selectable fixtures, camera controls and WebGL fallback.
- `src/App.tsx`: operational summaries, inspectors, decisions, event drawer and accessible controls.
- `src/shop/EuropeNetwork.tsx`: secondary country/store explorer, retaining the existing geography and catalogue.

## Inventory and payment

Every product batch tracks `received`, `shelf`, `backroom`, `receiving`, `inBaskets`, `inTransit`, `onFloor`, `sold`, `waste`, and `expiresAt`. The sum of all locations equals received units. Picks consume earliest-expiring shelf stock. Only payment moves basket units to sold and creates revenue. Staff collect real units before replenishing or completing collection orders. Expired shelf, backroom and receiving stock moves to waste.

Fixtures have fixed footprints. Occupancy-aware A* routes use half-metre lanes, then line-of-sight smoothing removes unnecessary grid turns without crossing fixtures or personal space. The floor is 42 × 36 with eight-metre fixtures. Each continuous movement segment checks personal-space clearance against other visible people; blocked walkers reroute or step aside rather than crossing another character. Interaction destinations are reserved, queue slots are separated from the active payment position, and entry is staggered. Twelve shopper journeys, six floor/checkout colleagues and Rémi on security keep the floor readable. Unassigned floor staff make department inspection rounds; checkout staff have working gestures. People stop when paused. Employee tasks reserve colleagues so simultaneous priorities cannot assign one person twice.

## Boundaries

The simulation has no remote persistence or broker connection. Reset recreates the seed and starting state. Other shops are illustrative profiles rather than additional simulations. The read-only shop assistant has a separate AWS backend and a real model connection; it cannot change simulation state. A future remote simulation adapter must replace local authority with server snapshots and authenticated commands; adding a broker transport to this browser state would not create a production retail system.

## Validation

Unit tests exercise conservation through transactions, delivery, replenishment and expiry; seeded replay; staffing; price consistency; decisions applying once; route safety and bounded history. Browser coverage checks desktop/mobile layouts, playback, modal pause restoration, inspector prices, event filtering, map profiles, reduced motion, reset and unsupported WebGL.

Manager choices set inventory, service, freshness and fulfilment policies. Local agents dispatch individual staff tasks under those policies. Inventory thresholds apply across departments, rather than treating a single shelf as a management decision.

Only two pending recommendations are exposed at a time. A one-shot decision log drives the recent outcome summaries; progress text comes from task stages and completed operations. Bakery promotions redirect two eligible shoppers and change shared prices; they never award stock or revenue directly.

## Contextual play and ambient activities

`interact(state, command)` handles typed walk, wave, chat, dance, browse, tidy, wobble and cleanup commands. A walk validates a collision-safe route before interrupting the current activity, reserves the selected person until arrival, and resumes their shopping or patrol afterwards. A new floor or shelf order can replace an earlier direction; cancelling a conversation releases both participants. Queue membership derives from stage, so directing a waiting shopper releases their place without losing basket stock. Transactions, cashiers and reserved staff tasks cannot be interrupted. `StoreActivity` reserves participants through approach, active and complete/cancelled phases. They use the existing collision-safe routes and resume normal shopping or patrol afterwards. Busy workers, cashiers and shoppers already at payment cannot abandon their jobs for a social activity. Approach deadlines release blocked participants safely.

`FloorItem` points to one real batch unit held in `onFloor`. The stock-conservation identity includes this location; only actual cleanup returns a sealed item or records fresh/expired goods as waste. Ambient rules schedule nearby conversations and occasional shelf tumbles with the seeded generator. They use the same commands and activity lifecycle as player actions. Active mishaps are bounded at two, completed visual activity is pruned, and the 600-event history remains the shared audit trail.

## Campaigns, needs and security

A `Promotion` selects the screen's message. `refreshPrices` derives every channel's price from that campaign and the independent agent freshness policy. Campaign changes redirect two eligible shoppers through ordinary shopping lists. They reserve no inventory and recognize no revenue until picking and payment.

Each optional shopper need has a product and waiting/helping/fulfilled state. No more than two unresolved needs are visible. The `help` activity reserves a colleague and shopper until both reach the aisle, then resumes a normal stock pick. Fulfillment requires an actual unit in the basket; a thank-you animation does not create goods. Self-found products also clear a need, without counting as assisted shoppers.

Rémi is a seventh employee with `job: security`. He is excluded from staffing, replenishment, cleanup and social task assignment. One `SecurityCase` can be active at once, with up to six recent cases retained. The deterministic receipt vignette leaves one genuine unscanned unit in `inBaskets`, pays the rest, and correlates the basket with its receipt. Rémi and the shopper route to separate meeting positions and must arrive before checking. Assisted payment settles the remaining unit exactly once; the alternative returns it to a real queue. Paid-bag and matched-receipt cases create neither another sale nor inventory. This is a local illustrative story generator, not a security integration.
