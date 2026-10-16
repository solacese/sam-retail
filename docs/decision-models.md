# Manager decisions

Four deterministic local specialist rules provide contextual recommendations. No model provider is called. A manager sees current evidence, an action, its operational benefit, a tradeoff, and an alternative. Opening the decision pauses simulation time. Resolving, closing or dismissing restores the previous manual playback state.

| Recommendation | Approved behavior | Tradeoff |
| --- | --- | --- |
| Apple replenishment | Available colleague collects up to 18 apples from the backroom and carries them to the shelf | Colleague unavailable during task |
| Checkout staffing | Available colleague walks to checkout 3 before it opens | €22 staffing cost and colleague committed to checkout |
| Fresh bakery deal | Four bakery products discounted 20% in the shared price state; new shopping trips favor the deal | Less margin per item, potential reduction in expired stock |
| Online collection | Available colleague picks four pantry units and brings them to collection; payment recorded on completion | Uses shelf stock and colleague time |

Each recommendation can be approved or deferred once. A deferred action does not execute. Stock, demand, staffing and queue outcomes remain visible. Solace is framed as successfully coordinating event updates; the choices concern business priorities, resource limits and incomplete future demand.
