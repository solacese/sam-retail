# Shop event topics

Local events use a hierarchical Solace-style topic:

```
abc/retail/v1/fr/paris-flagship/<domain>/<entity>/<action>
```

Examples emitted by the simulation:

```
abc/retail/v1/fr/paris-flagship/stock/sku-0/updated
abc/retail/v1/fr/paris-flagship/stock/sku-0/replenished
abc/retail/v1/fr/paris-flagship/price/sku-4/updated
abc/retail/v1/fr/paris-flagship/purchase/till/completed
abc/retail/v1/fr/paris-flagship/purchase/online/completed
abc/retail/v1/fr/paris-flagship/fridge/fresh/temperature
abc/retail/v1/fr/paris-flagship/camera/entrance/occupancy
abc/retail/v1/fr/paris-flagship/checkout/3/opened
abc/retail/v1/fr/paris-flagship/order/collection/ready
abc/retail/v1/fr/paris-flagship/agent/restock/approved
```

Future Solace subscriptions could use `abc/retail/v1/fr/paris-flagship/stock/>`, `abc/retail/v1/fr/paris-flagship/price/*/updated` or `abc/retail/v1/*/*/fridge/>`. In this demo the drawer filters by the event category; no subscriptions are installed on an external broker.

Events have an increasing local `id`, simulation timestamp `at`, `category`, `topic`, readable `message`, and optional fixture `target`. The latest 600 are retained, newest first. Stock, purchase, pricing and device events describe the same state used by the scene and inspectors.

Shop-life interactions also emit `people/{id}/destination/selected`, `people/{id}/waved`, `people/{id}/browsing`, `people/{walk|chat|dance|tidy|cleanup}/started`, `people/conversation/finished`, `display/{department}/tidied`, and `smartstore/floor/{id}/{detected|cleanup-assigned|cleared}` under the same `abc/retail/v1/fr/paris-flagship/` prefix. Floor events demonstrate successful sensor detection, stock updates and staff coordination.

The shop screen emits `promotion/screen/updated` and `promotion/screen/noticed/{person}`; campaign discounts use the existing `price/{sku}/updated` events. Shopper assistance uses `people/{id}/need/{created|help-assigned|fulfilled}`. Camera and receipt correlation emits `camera/exit/receipt/{case}/correlated`; the guard follows `security/case/{case}/{assigned|checking|resolved}`. An actual handheld payment produces `purchase/assisted/completed`, using the same inventory and transaction ledger as tills and online orders.
