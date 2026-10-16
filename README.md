# ABC Shop — a living 3D supermarket

A retailer-focused, interactive supermarket built with React, TypeScript, Three.js and React Three Fiber. Explore the Paris Flagship, inspect stock and equipment, review agent recommendations, and watch their effects reach the shop floor.

**Visit:** https://solacese.github.io/sam-retail/

## Explore the shop

- Drag to pan; scroll or pinch to zoom. Right-drag or use two fingers to rotate. Reset camera restores the overview.
- Click a department or fixture to inspect inventory, prices, expiry, queues, receiving or collection. The department list provides equivalent keyboard and touch controls.
- Watch up to 12 shoppers browse, pick groceries, queue, pay and leave. Six human colleagues serve checkouts, inspect departments, and carry out agent-coordinated tasks. People keep personal space, reserve separate destinations, and give way when paths meet. Six hairstyle silhouettes include cropped, swept, bob, curly, bun and wavy cuts. No robot agents appear inside the store.
- Choose four business priorities: product availability versus leaner stock, customer service versus operating costs, full-price margin versus lower waste, and online promises versus in-store capacity. Agents handle the individual replenishment, pricing, staffing and picking tasks. Each explains the evidence, outcome, and tradeoff. Decisions have no timer.
- Pause/Play freezes both simulation and people. Use 1×/2× speed or reset the store. Decisions, Help, Europe, and reset confirmation pause time without losing the prior playback state. Events remains live unless manually paused.
- A left-hand Store pulse panel shows total on-hand inventory and its locations, the current fridge temperature, occupancy, checkout status, a 30-second activity visualization, and a filtered scrolling live event feed. On phones it sits below the shop. Inventory includes baskets and staff transfers until payment, so picks do not falsely remove units from on-hand stock.
- Events retains the latest 600 timestamped messages, with Inventory, Pricing, Purchases, IoT, Agents and Operations filters. The pulse feed shows the most recent 32 matching messages and opens the full history.
- Europe shows 87 fictional shops across 41 countries. Each example store card presents its profile and two or three illustrative Solace Agent Mesh benefits. Only the Paris Flagship runs a full simulation.

## One source of truth

`src/simulation/store.ts` owns stock batches, shoppers, colleagues, routes, tasks, transactions, recommendations and events. The simulation advances in fixed 100ms steps; the Three.js scene interpolates people between updates. Stock moves between shelves, backroom, receiving, baskets, task cargo, sold units and waste. Restocking transfers stock; it never creates units. Deliveries add explicit batches.

Sales are recognized at payment. Gross profit subtracts product costs; the extra checkout's €22 staffing cost is shown separately in its inspector. Availability means products with shelf stock. Food waste includes expired batches. Queue time uses actual waiting durations. Satisfaction is an illustrative score derived from unfilled product requests and queue length, not a customer survey.

All channels use the same product price. A bakery deal updates shelf labels, checkout prices and the online catalog together. Shoppers favor the deal when starting a new shopping trip. Colleagues must reach their work location before opening a checkout, replenishing stock or completing an order. Agents handle routine replenishment automatically. The chosen inventory policy changes buffer thresholds across departments; service and fulfilment policies dispatch available colleagues without asking the manager to assign individual jobs.

**This is a self-contained local simulation.** Solace-style events and deterministic specialist rules demonstrate coordination; no live Solace broker, SAM service, model API, or credentials are connected. Commercial benefits on European store cards are examples, not measured results. See [architecture](docs/architecture.md), [topics](docs/store-topics.md) and [decisions](docs/decision-models.md).

## Develop and validate

Requires Node.js 22.18+ and npm.

```sh
npm ci
npm run dev                  # http://localhost:5173/sam-retail/
npm run check                # simulation invariants + TypeScript + production build
npx playwright install chromium webkit
npm run test:e2e              # desktop Chrome, mobile Chrome, mobile WebKit
```

The 3D scene loads separately from the operational interface. Phones use a lower pixel ratio and no real-time shadows. Reduced motion disables walking bob and interaction gestures while preserving meaningful movement. If WebGL is unavailable, the operational interface, stock inspectors and decisions remain available.

## Deployment and history

The existing `.github/workflows/pages.yml` checks, builds, browser-tests and publishes `dist/` on pushes to `main`. Vite uses `/sam-retail/`. Actions remain pinned to immutable SHAs.

The previous card game is preserved at Git tag `archive/card-game-2026-10-16`. This rebuild removes its independent telemetry and survival campaign.

## Assets and attribution

The flagship consists of procedural 3D geometry, not a background image. European store cards retain the ten generated illustrations documented in [shop artwork](docs/shop-artwork.md). Country boundaries and city points come from [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) public-domain data. Manrope is self-hosted under the included SIL Open Font License. Lucide icons use the ISC license. Solace is a trademark of Solace Corporation.
