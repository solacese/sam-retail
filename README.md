# Solace Mart

A large supermarket, a warehouse, online orders, five helpful agents, and two choices. A Reigns-inspired retail survival game with executable event correlation, cascading consequences, and a deliberately simple interface. All 72 cards use short, plain English. Solace keeps live updates flowing and coordinates bots; the manager decides how to balance cost, service, risk, and incomplete information.

**Play:** https://solacese.github.io/sam-retail/

## Play the game

- Swipe right or press → to approve. Swipe left or press ← to reject. Both options also have buttons. Cards tilt, lift, and leave along a curved path; short swipes spring back.
- Keep inventory, security, reputation, and cash above zero. Meters show health; the two choices show only their option text.
- There is **no decision time limit**. Results stay visible for 4.5 seconds. Day reports wait for your “Open day” action.
- A game has five days, six decisions per day. Three-day shifts are available with `?mode=quick`.
- Menu shows correlated event topics first, followed by a proposal attributed to an illustrative GPT / Claude / Gemini label. No model API is invoked; this is explained in How to play.
- Menu → “Why this card?” shows actual triggering events, the correlation rule, agent disagreement, and the deterministic recommendation.
- Cards show compact Events and Agents rows. Menu holds Your operation, Events, The mesh, and the full current card details. Opening it freezes live updates. There is no visible pause button; Space remains a keyboard shortcut.
- Best scores are stored locally and shown at the end. Replay a seed or share a link to challenge someone under the same starting conditions.

## Run locally

Requires Node.js 22.18 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:5173/sam-retail/.

```sh
npm run check                 # deterministic engine tests + TypeScript + production build
npx playwright install chromium webkit
npm run test:e2e              # desktop, mobile Chrome, and mobile Safari tests against the production build
npm run preview              # production preview, port 4173
```

## What's real in this demo?

The **simulation, event bus, correlation rules, resource calculations, delays, proposals, and score are real executable code**. Store events are synthetic. Agent dialogue and model labels are simulated; neither a Solace broker nor a live LLM is connected. There are no API keys or broker credentials in the browser.

Every decision emits an action event and downstream outcomes. Promotions increase demand and checkout pressure. Orders deliver after two decisions. Bulk stock can spoil after three. Suspicious returns can become losses. Different seeded shifts shuffle **eligible event-matched situations**, rather than playing an unrelated fixed deck.

The backend event adapter is a transport foundation for a future authenticated Solace integration; it is not a deployed real-broker mode. See [integration contract](docs/solace-integration.md).

## Project map

- `src/engine/game.ts`: seeded operational simulation, consequence executor, autonomy, and scoring.
- `src/engine/correlation.ts`: rolling-window rules and evidence collection.
- `src/engine/situations.ts`: 72 authored situations, agent personalities, and approve/reject effects.
- `src/engine/bus.ts`: local event bus and optional HTTPS/SSE backend transport.
- `src/App.tsx`: one-card UI, untimed interactions, reports, technical trace, replay, sharing.
- `public/illustrations/` and `public/portraits/`: generated supermarket artwork and agent portraits.
- `src/components/Illustrations.tsx`: lightweight avatars for supporting panels and the retained SVG shop illustration.
- `tests/`: engine invariants, seeded replay and balance qualification, mobile/desktop browser flows.

More detail: [architecture](docs/architecture.md), [event schema](docs/event-schema.md), [decision models](docs/decision-models.md).

## GitHub Pages

`vite.config.ts` sets `base: '/sam-retail/'`. The workflow in `.github/workflows/pages.yml` runs tests, builds, and deploys `dist/` on every push to `main`. Set Settings → Pages → Source to **GitHub Actions**. The site works with no backend, external fonts, or credentials.

## Assets

The Solace logo comes from [solace.com](https://solace.com/wp-content/uploads/2025/07/solace-logo.svg) and remains a Solace trademark. Manrope is self-hosted under its included SIL Open Font License (`public/fonts/OFL.txt`). Lucide icons use the ISC license. Generated portrait prompts and provenance are documented in `docs/illustrations.md` when generated artwork is included.
