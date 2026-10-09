# Optional Solace integration foundation

GitHub Pages uses `LocalEventBus` and simulated agents. No broker or LLM is connected. `BackendEventAdapter` implements the same publish/subscribe boundary over HTTPS POST and Server-Sent Events. It is an integration foundation, not a fully deployed second execution mode.

```ts
import { BackendEventAdapter } from "../src/engine/bus";
const transport = new BackendEventAdapter(
  "https://your-authenticated-backend.example",
);
const stop = transport.subscribe((event) => console.log(event.topic));
// Publish only backend-authorized events and commands under the authenticated session.
// stop(); transport.close();
```

## Backend contract

- `GET /events`: authenticated SSE, each `data:` record contains one `RetailEvent` envelope.
- `POST /events`: authenticated JSON command/event ingestion, returning a non-error HTTP status on acceptance.
- Authentication uses secure session cookies (`credentials: include`); the server owns broker credentials and model secrets.
- Enforce an explicit allowed frontend origin, credentialed CORS, CSRF protection, session-to-game authorization, runtime schema validation, idempotency by event/decision id, and replay ordering.
- Production action execution must be server-authoritative. Browser-supplied state, prices, model labels, resource deltas and simulated outcome messages are untrusted and must never authorize real operations.

## Target deployment

```text
Server-side retail simulator → Solace PubSub+
→ Correlation service → retail/situation/*
→ Solace Agent Mesh → Specialist agents + deterministic tool models
→ decision/proposed → HTTPS/SSE frontend
→ authenticated player approval → action executor
→ verified new business events → PubSub+
```

Keep simulation and operational topics in separate namespaces and ACLs. Grant specialists only the topics and tools needed for their role. Attach correlation and causation ids through agent collaboration. Restrict delegated actions with server-enforced limits. Route browser approval through an authenticated backend; never put broker passwords, bearer credentials, or model keys in Vite variables or Pages assets.

To implement a server-authoritative mode, add a remote game-session controller that consumes state/proposal snapshots and submits approvals; do not attach the transport to a locally authoritative game engine and call it a real deployment. No such deployment was claimed or smoke-tested for this demo.

References: [Solace](https://solace.com/), [Solace Agent Mesh documentation](https://solacelabs.github.io/solace-agent-mesh/).
