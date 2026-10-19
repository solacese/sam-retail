# ABC Shop — a living 3D supermarket

A retailer-focused, interactive supermarket built with React, TypeScript, Three.js and React Three Fiber. Explore the Paris Flagship, inspect stock and equipment, review agent recommendations, and watch their effects reach the shop floor.

**Play on AWS:** https://d2ghkgr2gk9p6l.cloudfront.net/

**GitHub Pages:** https://solacese.github.io/sam-retail/

## Explore the shop

- Drag to pan; scroll or pinch to zoom. Right-drag or use two fingers to rotate. Reset camera restores the overview.
- Click a department or fixture to inspect inventory, prices, expiry, queues, receiving or collection. The department list provides equivalent keyboard and touch controls.
- Explore a larger 42 × 36 store floor with wider aisles, eight-metre fixtures, a fully visible cutaway stockroom and automatic entrance doors. The ABC Shop / Paris Flagship identity stays in the readable interface, rather than on a distant wall.
- Watch up to 12 shoppers browse, pick groceries, queue, pay and leave. Six human colleagues serve checkouts, inspect departments, and carry out agent-coordinated tasks. Shopping lists cover four to six departments, with full-store trips and varied return visits. Browsing, gentle basket sway, grocery handling, blinks and goodbye waves add character; groceries move along the checkout belts. People keep personal space, reserve separate destinations, and give way when paths meet. Six hairstyle silhouettes include cropped, swept, bob, curly, bun and wavy cuts. No robot agents appear inside the store.
- Choose four business priorities: product availability versus leaner stock, customer service versus operating costs, full-price margin versus lower waste, and online promises versus in-store capacity. The agent team presents at most two pending choices at a time; resolving one reveals the next. Agents handle the individual replenishment, pricing, staffing and picking tasks. A compact “Your choices in action” section reports actual work progress, and floor colleagues have small task labels. Each explains the evidence, outcome, and tradeoff. Decisions have no timer.
- Pause/Play freezes both simulation and people. Use 1×/2× speed or reset the store. Decisions, Help, Europe, and reset confirmation pause time without losing the prior playback state. Events remains live unless manually paused.
- A left-hand Store pulse panel shows total on-hand inventory and its locations, the current fridge temperature, a 30-second activity visualization, and a filtered scrolling live event feed. Occupancy stays in the KPI strip and checkout staffing in its inspector. On phones the pulse sits below the shop. Inventory includes baskets and staff transfers until payment, so picks do not falsely remove units from on-hand stock.
- Small blue payment bubbles appear above the terminal that actually charged the basket, with the paid amount. Green bubbles mark real stock picks and shelf refills at the affected fixture. Gentle floor rings use the same colors as the live event feed. Effects last 3.2 simulation seconds, combine repeated updates at the same fixture, freeze on Pause, and remove floating movement with reduced motion. Startup snapshots do not flash.
- The interface and in-shop signs share the locally hosted Manrope typeface. On desktop the shop and playback controls fit the available screen height; side panels scroll independently.
- Events retains the latest 600 timestamped messages, with Inventory, Pricing, Purchases, IoT, Agents and Operations filters. The pulse feed shows the most recent 32 matching messages and opens the full history.
- Europe shows 87 fictional shops across 41 countries. Each example store card presents its profile and two or three illustrative Solace Agent Mesh benefits. Only the Paris Flagship runs a full simulation.

## One source of truth

`src/simulation/store.ts` owns stock batches, shoppers, colleagues, routes, tasks, transactions, recommendations and events. The simulation advances in fixed 100ms steps; the Three.js scene interpolates people between updates. Stock moves between shelves, backroom, receiving, baskets, task cargo, dropped floor items, sold units and waste. Restocking transfers stock; it never creates units. Deliveries add explicit batches.

Sales are recognized at payment. Gross profit subtracts product costs; the extra checkout's €22 staffing cost is shown separately in its inspector. Availability means products with shelf stock. Food waste includes expired batches. Queue time uses actual waiting durations. Satisfaction is an illustrative score derived from unfilled product requests and queue length, not a customer survey.

All channels use the same product price. A bakery deal updates shelf labels, checkout prices and the online catalog together. Two browsing shoppers respond immediately to a new deal by routing to the bakery; return visits also favor it. Colleagues must reach their work location before opening a checkout, replenishing stock or completing an order. Agents handle routine replenishment automatically. The chosen inventory policy changes buffer thresholds across departments; service and fulfilment policies dispatch available colleagues without asking the manager to assign individual jobs.

**The shop runs as a local simulation.** Solace-style events and deterministic specialist rules demonstrate coordination; no live Solace broker or SAM service is connected. The read-only **Ask the shop** assistant uses a real model through a separate AWS backend, grounded in your browser's current shop data. Commercial benefits on European store cards are examples, not measured results. See [architecture](docs/architecture.md), [topics](docs/store-topics.md) and [decisions](docs/decision-models.md).

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

AWS uses a private encrypted S3 bucket and an HTTPS CloudFront distribution, defined in `infra/aws-static.yaml`. With an authorized AWS CLI session, run `npm run deploy:aws` from a clean, committed checkout. It builds with a root base path, applies the `sam-retail-demo` stack in `ca-central-1`, uploads assets before the entry page, and invalidates the entry page cache. Override `AWS_REGION` and `RETAIL_AWS_STACK` for a separate deployment. `release.json` records the exact Git commit. Old hashed assets are retained so open tabs keep working. No credentials are embedded in the site.

The existing `.github/workflows/pages.yml` checks, builds, browser-tests and publishes `dist/` on pushes to `main`. Vite uses `/sam-retail/`. Actions remain pinned to immutable SHAs.

The previous card game is preserved at Git tag `archive/card-game-2026-10-16`. This rebuild removes its independent telemetry and survival campaign.

## Assets and attribution

The flagship consists of procedural 3D geometry, not a background image. European store cards retain the ten generated illustrations documented in [shop artwork](docs/shop-artwork.md). Country boundaries and city points come from [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) public-domain data. Manrope is self-hosted under the included SIL Open Font License. Lucide icons use the ISC license. Solace is a trademark of Solace Corporation.

## Little shop life

Click a person, then click an open floor spot to send them there. Click a shelf to have that same shopper browse it, or a floor colleague tidy it. Click another spot to change direction; a green floor marker shows the destination. Close the person panel to inspect fixtures again. Enlarged, camera-aware click targets favor visible people when targets overlap, and each portrait has an expressive face and one of the six matching hairstyles. Wave hello, start a nearby conversation, take a tiny dance break, or use the aisle dropdown for keyboard control. Floor colleagues can tidy a display; occupied workers and checkout staff keep their assigned jobs. A selection diamond, speech bubbles and gestures show who is doing what. The collapsed **People in the shop** menu provides the same controls for keyboard users and the WebGL fallback. On phones, a compact person panel keeps the floor visible; More actions expands the social controls. Floor and shelf orders preserve selection without scrolling the camera away. Directions can interrupt browsing, a queue or a social moment while preserving baskets; payment, checkout staffing and reserved stock tasks finish first.

Shelf inspectors now offer **Send a shopper here**, **Tidy this display**, and **A little shelf wobble**. Shoppers also start occasional conversations on their own, and small seeded mishaps happen during normal store life. A dropped item moves from shelf stock to an explicit `onFloor` location; it remains owned inventory but cannot be sold. An available colleague walks over to clean up. Sealed goods return to the shelf; loose produce and bakery goods, or expired goods, become recorded waste. Nothing creates stock or revenue by animation. Floor detections, assigned cleanup, and completed work appear in the same Solace-style event stream. No more than two floor mishaps can be active at once.

All these activities share simulation time, Pause/Play, 1×/2×, reduced motion, and reset. Conversations reserve both participants and resume their shopping afterwards. Cleanup and tidying reserve the colleague so agent tasks cannot double-book them.

## The screen, shopper needs and Rémi

Click the freestanding **shop screen** or open **Promotions** to advertise bakery treats (20% off), lunch picks (15% off sandwiches, salad bowls and juice), or a warm welcome. Two eligible shoppers notice an offer and physically head to its products. Shelf, till, online and screen prices share the same state. Changing campaigns restores regular prices except for an agent-approved bakery deal, which remains in effect. Promotions never create stock or sales.

At most two shoppers ask for coffee or lunch in little thought bubbles. Click the person and choose **Help find coffee/lunch**. A free colleague escorts them to the aisle, then the shopper picks an actual item. If the team is occupied, the shopper follows the aisle signs. Their basket and the event stream show the outcome. Shoppers can also find what they need on their own.

**Rémi**, the guard in blue, patrols near the entrance. Click him or open **Security** to see a receipt check, a forgotten paid bag, or an already-matched receipt. You can request a friendly check or send an unpaid item back to a staffed checkout. Rémi also acts on his own. A missed item stays in basket stock until real payment, either at a till or on his handheld. Returning a paid bag does not charge it again or add inventory. These are seeded shop-life stories, not live fraud detection or accusations. Camera, basket, receipt and staff events show successful local coordination.

Select a shopper with groceries, then expand **More actions** to **Put one basket item down** or **Try leaving without paying**. The first transfers one actual unit onto the floor for a colleague to collect. The second sends the shopper toward the exit; only arrival triggers the sensor, basket/payment correlation and Rémi's response. Rémi sends the shopper back to the shortest open checkout queue with their basket still unpaid. They walk to the till, wait their turn, and pay normally before leaving. The security outcome reports payment pending, then confirms the actual till payment. Both actions have visible gestures and streamed consequences. Busy shoppers and empty baskets cannot perform them.

Seeded spontaneous stories include basket drops, helpful colleagues, shoppers discussing active offers, and occasional unpaid exit attempts. Word of mouth sends people to real offer products; it never fabricates a purchase. Till lanes have separate payment and queue positions with generous spacing, so a waiting shopper cannot block the next customer's payment spot. Routing connects exact destinations to clear navigation cells instead of treating a rounded, occupied grid cell as an unreachable destination.

## Ask the shop

A compact chat beneath the agent decisions answers questions about inventory, fridge readings, sales, queues and incidents. Suggestions start a conversation; follow-ups retain up to three exchanges. Each request captures the current browser simulation, including all 24 products, stock locations, prices, operating KPIs, pending/resolved security checks, floor incidents and 60 meaningful recent events. Replies show the snapshot time. Chat does not pause or modify the shop. Reset clears the conversation and cancels an outstanding request.

The browser calls a public HTTP API; it never receives the LiteLLM key. `server/chat.cjs` runs in Lambda and reads `sam-retail/demo/litellm` from AWS Secrets Manager. The secret JSON contains an `apiKey` property, maintained through Secrets Manager rather than Git or Vite environment variables. The backend calls only the configured LiteLLM endpoint/model, limits input/history/output, checks allowed origins, and uses atomic DynamoDB counters for 10 requests per minute per IP and 300 requests per UTC day across the demo. It logs neither prompts nor credentials. These public-demo limits are cost controls, not user authentication. Production/private store data requires authenticated users and server-authoritative inventory.

`infra/aws-chat.mjs` defines the Lambda, least-privilege IAM role, HTTP API, short-lived quota counters and seven-day operational logs. `npm run deploy:aws` also deploys the chat stack before building the site. It requires the existing Secrets Manager credential. `node scripts/deploy-chat.mjs` updates just the backend. The public API address is configured in `src/chat/ShopChat.tsx`; `VITE_SHOP_CHAT_URL` can override that non-secret address. `SHOP_CHAT_MODEL` selects the server model on deployment (default `azure-gpt-4o-mini`). GitHub Pages and local development use the same backend. Automated browser tests stub model replies; a separate live smoke test checks the actual gateway.

## Retail story inspiration

[SymphonyAI’s grocery case study](https://www.symphonyai.com/resource/case-study/retail-cpg/national-supermarket-chain-drives-200m-profit-vertical-ai) informs the focus on linking promotions, margin and on-shelf availability to everyday decisions. The bakery decision reports units actually paid for, sales and gross profit since approval, using recorded transaction prices. This is an observed result, not a causal uplift calculation. The case study’s reported financial results are not used as ABC Shop outcomes. The shop assistant receives the same observed decision results.
