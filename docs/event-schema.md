# Local event interface

The current `StoreEvent` interface is defined in `src/simulation/store.ts`:

```ts
interface StoreEvent {
  id: number;
  at: number; // seconds since 09:00 in simulation time
  category: 'inventory' | 'pricing' | 'purchases' | 'iot' | 'agents' | 'operations';
  topic: string;
  message: string;
  target?: string; // fixture or department used for a brief scene highlight
}
```

IDs increase within a run. Reset restarts the local sequence. A single state update creates both the operational effect and its describing events. Price event values and transaction prices come from `Product.price`, avoiding independent channel prices. There are no external producers or guaranteed delivery claims in this local demo.
