# Event contract

The authoritative TypeScript definition is `RetailEvent` in `src/engine/types.ts`.

```json
{
  "id": "a21b09f3-41",
  "sequence": 41,
  "step": 3,
  "minute": 690,
  "topic": "supplier/order/created",
  "category": "action",
  "source": "STOCKY",
  "data": { "quantity": 9, "arrivalStep": 5 },
  "correlationId": "proposal-3",
  "causationId": "a21b09f3-40",
  "simulated": true
}
```

- `id`: game-local unique event id; seed hash and monotonic sequence.
- `sequence`: monotonic ordering within the shift.
- `step`: absolute decision interval; persists across day boundaries.
- `minute`: simulated store clock used by rolling correlation windows.
- `topic`: slash-separated operational topic, compatible with broker topic naming.
- `category`: `business`, `pattern`, `agent`, `message`, `decision`, `action`, or `outcome`.
- `source`: emitting service or simulated specialist.
- `data`: typed primitive payload; no credentials or personal customer data.
- `correlationId`: proposal id connecting pattern, agent collaboration, choice and outcome.
- `causationId`: immediate originating event; delayed actions retain the original player action id.
- `simulated`: explicitly distinguishes synthetic demonstration events.

Representative topics: `pos/sale/completed`, `inventory/stock/low`, `inventory/stockout`, `supplier/delivery/delayed`, `security/return/suspicious`, `marketing/campaign/started`, `customer/review/negative`, `operations/queue/long`, `store/shelf/empty`, `finance/cash/critical`, `retail/situation/stock_risk`, `agent/triggered`, `agent/message`, `decision/proposed`, `player/approved`, `retail/action/executed`, `retail/outcome/verified`.

The UI retains the latest 240 events; proposal evidence preserves the triggering event objects independently. This bounded browser history is not a durable broker or production audit store.
