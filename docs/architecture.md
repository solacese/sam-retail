# Store simulation architecture

The flagship is authoritative in one browser-local `StoreState`. `advance(state, dt)` mutates it in deterministic fixed steps. A seeded generator controls shopping-list choices. `useSimulation` owns the state reference, playback state and 100ms UI snapshots. The renderer reads the same reference and interpolates people at display refresh rate.

- `src/simulation/store.ts`: typed products, batches, people, tasks, transactions, recommendations, events, pathfinding and calculations.
- `src/simulation/useSimulation.ts`: fixed-step lifecycle, overlay pause, speed, decisions and reset.
- `src/shop/StoreScene.tsx`: orthographic Three.js world, stock instances, animated people, selectable fixtures, camera controls and WebGL fallback.
- `src/App.tsx`: operational summaries, inspectors, decisions, event drawer and accessible controls.
- `src/shop/EuropeNetwork.tsx`: secondary country/store explorer, retaining the existing geography and catalogue.

## Inventory and payment

Every product batch tracks `received`, `shelf`, `backroom`, `receiving`, `inBaskets`, `inTransit`, `sold`, `waste`, and `expiresAt`. The sum of all locations equals received units. Picks consume earliest-expiring shelf stock. Only payment moves basket units to sold and creates revenue. Staff collect real units before replenishing or completing collection orders. Expired shelf, backroom and receiving stock moves to waste.

Fixtures have fixed footprints. Grid routes avoid their occupied cells; continuous movement follows those routes. People stop when paused. Employee tasks reserve colleagues so two approvals cannot assign the same person simultaneously.

## Boundaries

There is no backend, persistence, broker connection or live model call. Reset recreates the seed and starting state. Other shops are illustrative profiles rather than additional simulations. A future remote adapter must replace local authority with server snapshots and authenticated commands; adding a broker transport to this browser state would not create a production retail system.

## Validation

Unit tests exercise conservation through transactions, delivery, replenishment and expiry; seeded replay; staffing; price consistency; decisions applying once; route safety and bounded history. Browser coverage checks desktop/mobile layouts, playback, modal pause restoration, inspector prices, event filtering, map profiles, reduced motion, reset and unsupported WebGL.
