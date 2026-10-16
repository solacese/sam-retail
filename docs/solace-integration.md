# Future Solace integration

The current release is entirely local. It demonstrates Solace-style event topics and specialist coordination using deterministic rules. No broker or model API is connected. The former card game's `BackendEventAdapter` is preserved only in the `archive/card-game-2026-10-16` Git tag.

A future integrated mode should use a server-authoritative simulation, authenticated store sessions, server-side broker credentials, and idempotent decision commands. The browser would render validated snapshots and submit approvals to a backend. No credentials should be embedded in GitHub Pages or Vite variables. Topic permissions and order authorization must be enforced server-side.

The documented topic hierarchy is a proposed demo convention, not a deployed production schema. Commercial benefits on store profiles remain illustrative until measured against an actual deployment.
