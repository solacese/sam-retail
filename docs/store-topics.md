# Shop event topics

The local demo follows Solace's Domain / Noun / Verb / Properties structure:

`abc/retail/{object}/{action}/v1/{country}/{shop}/{entity}`

Country codes are lowercase ISO codes, shop IDs match the catalogue, and entities are product, order, sensor, or robot IDs. Quantities, prices, temperatures, and outcomes stay in event details rather than topic levels.

Examples for Paris Market:

- `abc/retail/inventory/updated/v1/fr/fr-0/milk`
- `abc/retail/price/updated/v1/fr/fr-0/milk`
- `abc/retail/purchase/completed/v1/fr/fr-0/order-12`
- `abc/retail/fridge/temperatureUpdated/v1/fr/fr-0/fridge-1`
- `abc/retail/camera/statusUpdated/v1/fr/fr-0/entrance-1`
- `abc/retail/robot/taskAssigned/v1/fr/fr-0/stocky`
- `abc/retail/decision/applied/v1/fr/fr-0/{decisionId}`

The friendly category buttons use topic subscriptions: Pricing matches `abc/retail/price/*/v1/fr/fr-0/>`; IoT subscribes to both fridge and camera; All matches `abc/retail/*/*/v1/fr/fr-0/>`. The local matcher supports whole-level `*` and terminal `>` with one-or-more trailing levels. It is a demo matcher, not a complete Solace client implementation.

Stocky, Penny, and Shield coordinate from outside the shop and move in response to inventory, purchase, pricing, and sensor events. Human shoppers inside follow shelf → checkout → exit routes driven by the purchase stream, with pickup and payment gestures after arrival. Holding the feed freezes its visible snapshot while shop events and robots continue. Reduced motion keeps robots and shoppers still, preserves pickup/payment poses, and removes flying parcels.

The static Pages demo creates events in the browser and bridges game decisions into the shop feed. It does not connect to an external broker. Core correlation rules keep their existing canonical topics.

Reference: [Solace EDA basics: topic architecture and subscriptions](https://docs.solace.com/Get-Started/tutorial/event-broker-basics.htm).
