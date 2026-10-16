/** One deterministic source of truth for the store, scene and event stream. */
export type Point = [number, number];
export type Category =
  | "inventory"
  | "pricing"
  | "purchases"
  | "iot"
  | "agents"
  | "operations";
export type DecisionKind = "restock" | "checkout" | "meal" | "online";
export interface Department {
  id: string;
  name: string;
  color: string;
  position: Point;
  kind: "produce" | "shelf" | "fridge" | "bakery";
}
export const DEPARTMENTS: Department[] = [
  {
    id: "produce",
    name: "Fruit & veg",
    color: "#82a45b",
    position: [-10, -5],
    kind: "produce",
  },
  {
    id: "bakery",
    name: "Bakery",
    color: "#d4a265",
    position: [0, -5],
    kind: "bakery",
  },
  {
    id: "fresh",
    name: "Fresh & chilled",
    color: "#7dabb2",
    position: [10, -5],
    kind: "fridge",
  },
  {
    id: "pantry",
    name: "Pantry",
    color: "#d28b6c",
    position: [-10, 2],
    kind: "shelf",
  },
  {
    id: "drinks",
    name: "Drinks",
    color: "#a594b8",
    position: [0, 2],
    kind: "shelf",
  },
  {
    id: "home",
    name: "Home & care",
    color: "#89aaa0",
    position: [10, 2],
    kind: "shelf",
  },
];
export interface Product {
  id: string;
  name: string;
  department: string;
  price: number;
  regularPrice: number;
  cost: number;
  color: string;
  shape: "box" | "bottle" | "round";
  position: Point;
}
export interface ProductBatch {
  id: string;
  productId: string;
  received: number;
  shelf: number;
  backroom: number;
  receiving: number;
  inBaskets: number;
  inTransit: number;
  sold: number;
  waste: number;
  expiresAt: number;
}
export interface BasketLine {
  batchId: string;
  productId: string;
  quantity: number;
}
export interface Person {
  id: number;
  role: "shopper" | "employee";
  position: Point;
  route: Point[];
  stage:
    | "entering"
    | "shopping"
    | "picking"
    | "queueing"
    | "paying"
    | "leaving"
    | "outside"
    | "working"
    | "task";
  timer: number;
  basket: BasketLine[];
  list: string[];
  visited: number;
  checkout: number;
  queueSince: number;
  taskId?: string;
  outfit: string;
  skin: string;
}
export interface StaffTask {
  id: string;
  kind: DecisionKind;
  employeeId: number;
  stage: "source" | "destination" | "complete";
  timer: number;
  productId: string;
  cargo: BasketLine[];
}
export interface Transaction {
  id: number;
  at: number;
  source: "till" | "online";
  lines: { productId: string; quantity: number; unitPrice: number }[];
  revenue: number;
  cost: number;
}
export interface Recommendation {
  id: DecisionKind;
  title: string;
  agent: string;
  action: string;
  alternative: string;
  consequence: string;
  tradeoff: string;
  status: "pending" | "applied" | "declined";
}
export interface StoreEvent {
  id: number;
  at: number;
  category: Category;
  topic: string;
  message: string;
  target?: string;
}
export interface StoreState {
  time: number;
  seed: number;
  tick: number;
  people: Person[];
  products: Product[];
  batches: ProductBatch[];
  tasks: StaffTask[];
  transactions: Transaction[];
  events: StoreEvent[];
  recommendations: Recommendation[];
  checkouts: boolean[];
  mealActive: boolean;
  onlineComplete: number;
  operatingCosts: number;
  lostSales: number;
  fulfilled: number;
  queueSamples: number[];
  fridge: number;
  nextEvent: number;
  deliveryCount: number;
}
const GOODS = [
  ["Apples", 239, 110, "#bd5b49", "round"],
  ["Bananas", 179, 82, "#e2bc53", "round"],
  ["Tomatoes", 249, 115, "#c8694c", "round"],
  ["Avocados", 199, 98, "#6f8b48", "round"],
  ["Sourdough", 349, 135, "#c68d4b", "round"],
  ["Croissants", 129, 44, "#dfad65", "round"],
  ["Sandwiches", 449, 190, "#a4b88a", "box"],
  ["Muffins", 219, 78, "#ad7852", "round"],
  ["Milk", 169, 90, "#e3ebd9", "bottle"],
  ["Yogurt", 249, 110, "#9abccc", "box"],
  ["Cheese", 329, 160, "#e5c76e", "box"],
  ["Salad bowls", 499, 220, "#81a96d", "box"],
  ["Pasta", 189, 72, "#ddb85b", "box"],
  ["Rice", 229, 100, "#f0dfb2", "box"],
  ["Cereal", 379, 150, "#c67c61", "box"],
  ["Soup", 199, 85, "#93a878", "bottle"],
  ["Orange juice", 299, 130, "#de9c4a", "bottle"],
  ["Sparkling water", 99, 35, "#85adb3", "bottle"],
  ["Coffee", 549, 260, "#9a7060", "box"],
  ["Tea", 329, 110, "#8eaa85", "box"],
  ["Hand soap", 249, 88, "#a6babb", "bottle"],
  ["Shampoo", 399, 145, "#b2a7c4", "bottle"],
  ["Kitchen roll", 299, 130, "#eee8d3", "box"],
  ["Laundry liquid", 649, 280, "#83a89b", "bottle"],
] as const;
export const ENTRY: Point = [12, 14];
export const STOCKROOM: Point = [8, -10];
export const PICKUP: Point = [14, 8];
export const TILLS: Point[] = [
  [-10, 8],
  [-3, 8],
  [4, 8],
];
const outfits = [
  "#b76e56",
  "#718c9f",
  "#c3a056",
  "#9c88ad",
  "#629187",
  "#d59b8c",
  "#5c6d83",
  "#b3b57e",
];
const skins = ["#e6bc96", "#bd8763", "#82543e", "#f1cfae", "#a36f51"];
function random(s: StoreState) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
export function stock(s: StoreState, id: string) {
  return s.batches
    .filter((b) => b.productId === id)
    .reduce(
      (a, b) => ({
        shelf: a.shelf + b.shelf,
        backroom: a.backroom + b.backroom,
        receiving: a.receiving + b.receiving,
        waste: a.waste + b.waste,
      }),
      { shelf: 0, backroom: 0, receiving: 0, waste: 0 },
    );
}
function blocked(x: number, z: number) {
  if (x < -15 || x > 15 || z < -12 || z > 14) return true;
  return (
    DEPARTMENTS.some(
      (d) =>
        Math.abs(x - d.position[0]) < 3.8 && Math.abs(z - d.position[1]) < 1.3,
    ) || TILLS.some((t) => Math.abs(x - t[0]) < 1.2 && Math.abs(z - t[1]) < 0.6)
  );
}
/** Grid route avoids fixtures. Each segment is clear, allowing smooth interpolation. */
export function routeBetween(start: Point, end: Point): Point[] {
  const from: Point = [Math.round(start[0]), Math.round(start[1])],
    to: Point = [Math.round(end[0]), Math.round(end[1])];
  const key = (p: Point) => `${p[0]},${p[1]}`;
  const queue: Point[] = [from],
    parents = new Map<string, Point | null>([[key(from), null]]);
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    if (key(p) === key(to)) {
      const path: Point[] = [];
      let c: Point | null = p;
      while (c) {
        path.unshift(c);
        c = parents.get(key(c)) ?? null;
      }
      path.shift();
      path.push(end);
      return path;
    }
    for (const [dx, dz] of [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ]) {
      const n: Point = [p[0] + dx, p[1] + dz];
      if (!blocked(...n) && !parents.has(key(n))) {
        parents.set(key(n), p);
        queue.push(n);
      }
    }
  }
  return []; // No walking through fixtures if a destination is unavailable.
}
function go(p: Person, end: Point) {
  p.route = routeBetween(p.position, end);
}
function emit(
  s: StoreState,
  category: Category,
  suffix: string,
  message: string,
  target?: string,
) {
  s.events.unshift({
    id: s.nextEvent++,
    at: s.time,
    category,
    topic: `abc/retail/v1/fr/paris-flagship/${suffix}`,
    message,
    target,
  });
  if (s.events.length > 600) s.events.length = 600;
}
export function createStore(seed = 2401): StoreState {
  const products: Product[] = GOODS.map((g, i) => {
    const d = DEPARTMENTS[Math.floor(i / 4)];
    return {
      id: `sku-${i}`,
      name: g[0],
      price: g[1],
      regularPrice: g[1],
      cost: g[2],
      color: g[3],
      shape: g[4],
      department: d.id,
      position: [d.position[0] + ((i % 4) - 1.5) * 1.6, d.position[1] + 2],
    };
  });
  const s: StoreState = {
    time: 0,
    seed,
    tick: 0,
    people: [],
    products,
    batches: products.flatMap((p, i) => {
      const nearExpiry = p.department === "bakery";
      const shelf = i === 0 ? 5 : 14 + (i % 6);
      const batch: ProductBatch = {
        id: `batch-${i}`,
        productId: p.id,
        received: shelf + (nearExpiry ? 0 : 36),
        shelf,
        backroom: nearExpiry ? 0 : 36,
        receiving: 0,
        inBaskets: 0,
        inTransit: 0,
        sold: 0,
        waste: 0,
        expiresAt: nearExpiry ? 160 + i * 4 : i >= 12 ? 86400 : 3600,
      };
      // Fresh reserve is a separate batch; a shelf deal must not imply that
      // all unopened stock in the backroom has the same short expiry.
      return nearExpiry
        ? [
            batch,
            {
              ...batch,
              id: `reserve-${i}`,
              received: 36,
              shelf: 0,
              backroom: 36,
              expiresAt: 3600,
            },
          ]
        : [batch];
    }),
    tasks: [],
    transactions: [],
    events: [],
    recommendations: [
      {
        id: "restock",
        title: "Keep the apple shelf full",
        agent: "Inventory agent",
        action: "Send a colleague to restock",
        alternative: "Keep the team on the floor",
        consequence: "Moves up to 18 apples from the stockroom to the shelf.",
        tradeoff: "One colleague is busy until the shelf is replenished.",
        status: "pending",
      },
      {
        id: "checkout",
        title: "Give the queue another checkout",
        agent: "Store operations agent",
        action: "Open checkout 3",
        alternative: "Keep the current two checkouts",
        consequence: "A colleague walks over and opens another checkout.",
        tradeoff:
          "Adds €22 in staffing cost; one fewer colleague is available for other work.",
        status: "pending",
      },
      {
        id: "meal",
        title: "Sell fresh food before it expires",
        agent: "Fresh food agent",
        action: "Launch a 20% bakery deal",
        alternative: "Keep the regular prices",
        consequence:
          "Bakery prices update together on shelves, tills, and online. Shoppers are more likely to choose bakery items.",
        tradeoff:
          "A lower margin on each item, with a better chance of selling it before expiry.",
        status: "pending",
      },
      {
        id: "online",
        title: "Get the collection order ready",
        agent: "Order fulfilment agent",
        action: "Prioritize the online order",
        alternative: "Keep the colleague available",
        consequence:
          "A colleague picks four pantry items and brings them to collection.",
        tradeoff:
          "Uses stock and a colleague that could serve people in the shop.",
        status: "pending",
      },
    ],
    checkouts: [true, true, false],
    mealActive: false,
    onlineComplete: 0,
    operatingCosts: 0,
    lostSales: 0,
    fulfilled: 0,
    queueSamples: [],
    fridge: 3.6,
    nextEvent: 1,
    deliveryCount: 0,
  };
  for (let i = 0; i < 32; i++) {
    const p: Person = {
      id: i,
      role: "shopper",
      position: [ENTRY[0] + (i % 3) * 0.35, ENTRY[1]],
      route: [],
      stage: "entering",
      timer: i * 0.5,
      basket: [],
      list: [],
      visited: 0,
      checkout: 0,
      queueSince: 0,
      outfit: outfits[i % outfits.length],
      skin: skins[i % skins.length],
    };
    p.list = Array.from(
      { length: 3 },
      (_, n) => products[(i * 7 + n * 5) % 24].id,
    );
    if (i < 24) {
      const product = products[(i * 7) % 24];
      p.position = [product.position[0] + (i % 2) * 0.3, product.position[1]];
      p.stage = "picking";
      p.timer = 0.7 + (i % 4);
    }
    if (i >= 18 && i < 24) {
      p.position = [TILLS[i % 2][0] + 1.8, 10 + (i % 3) * 0.6];
      for (const productId of p.list.slice(0, 2))
        p.basket.push(...take(s, productId, 1, "shelf", "inBaskets"));
      p.visited = p.list.length;
      joinQueue(s, p);
    }
    s.people.push(p);
  }
  for (let i = 0; i < 8; i++)
    s.people.push({
      id: 100 + i,
      role: "employee",
      position: i < 2 ? [TILLS[i][0], 7] : [-13 + (i - 2) * 5, -9],
      route: [],
      stage: "working",
      timer: i,
      basket: [],
      list: [],
      visited: 0,
      checkout: i,
      queueSince: 0,
      outfit: "#2f6755",
      skin: skins[(i + 2) % skins.length],
    });
  for (const p of s.products)
    emit(
      s,
      "inventory",
      `stock/${p.id}/updated`,
      `${p.name} · ${stock(s, p.id).shelf} on shelf`,
      p.department,
    );
  emit(
    s,
    "operations",
    "order/collection/requested",
    "A four-item pantry order is ready to pick.",
    "pickup",
  );
  emit(
    s,
    "operations",
    "checkout/staffing/updated",
    "Two staffed checkouts open; a third can be opened.",
    "checkouts",
  );
  emit(
    s,
    "inventory",
    "batch/bakery/expiry",
    "Fresh bakery stock expires in about three minutes.",
    "bakery",
  );
  emit(
    s,
    "operations",
    "store/opened",
    "Paris Flagship is open. 32 shoppers, 8 colleagues.",
  );
  emit(
    s,
    "agents",
    "agent/recommendation/created",
    "Four recommendations are ready for your review.",
  );
  return s;
}
function move(p: Person, dt: number) {
  let distance = dt * (p.role === "employee" ? 2.5 : 1.7 + (p.id % 4) * 0.15);
  while (p.route.length && distance > 0) {
    const next = p.route[0],
      dx = next[0] - p.position[0],
      dz = next[1] - p.position[1],
      length = Math.hypot(dx, dz);
    if (length <= distance) {
      p.position = [...next];
      p.route.shift();
      distance -= length;
    } else {
      p.position = [
        p.position[0] + (dx / length) * distance,
        p.position[1] + (dz / length) * distance,
      ];
      distance = 0;
    }
  }
}
function take(
  s: StoreState,
  productId: string,
  amount: number,
  location: "shelf" | "backroom",
  destination: "inBaskets" | "inTransit",
) {
  const lines: BasketLine[] = [];
  let left = amount;
  for (const b of [...s.batches].sort((a, b) => a.expiresAt - b.expiresAt)) {
    if (b.productId !== productId || b.expiresAt <= s.time) continue;
    const n = Math.min(left, b[location]);
    if (!n) continue;
    b[location] -= n;
    b[destination] += n;
    lines.push({ batchId: b.id, productId, quantity: n });
    left -= n;
    if (!left) break;
  }
  return lines;
}
function settle(
  s: StoreState,
  cargo: BasketLine[],
  source: "till" | "online",
  location: "inBaskets" | "inTransit",
) {
  if (!cargo.length) return;
  const lines = cargo.map((l) => {
    const b = s.batches.find((b) => b.id === l.batchId)!;
    b[location] -= l.quantity;
    b.sold += l.quantity;
    return {
      productId: l.productId,
      quantity: l.quantity,
      unitPrice: s.products.find((p) => p.id === l.productId)!.price,
    };
  });
  const revenue = lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0),
    cost = lines.reduce(
      (a, l) =>
        a + s.products.find((p) => p.id === l.productId)!.cost * l.quantity,
      0,
    );
  s.transactions.push({
    id: s.transactions.length + 1,
    at: s.time,
    source,
    lines,
    revenue,
    cost,
  });
  emit(
    s,
    "purchases",
    `purchase/${source}/completed`,
    `${source === "online" ? "Collection order" : "Basket"} paid · €${(revenue / 100).toFixed(2)} · ${lines.reduce((n, l) => n + l.quantity, 0)} items`,
    source === "online" ? "pickup" : "checkouts",
  );
}
function joinQueue(s: StoreState, p: Person) {
  p.checkout = s.checkouts
    .map((open, i) => ({
      i,
      count: open
        ? s.people.filter(
            (p) =>
              (p.stage === "queueing" || p.stage === "paying") &&
              p.checkout === i,
          ).length
        : Infinity,
    }))
    .sort((a, b) => a.count - b.count)[0].i;
  p.stage = "queueing";
  p.queueSince = s.time;
}
function shopNext(s: StoreState, p: Person) {
  if (p.visited >= p.list.length) {
    joinQueue(s, p);
    return;
  }
  const product = s.products.find((v) => v.id === p.list[p.visited])!;
  p.stage = "shopping";
  go(p, [product.position[0], product.position[1] + (p.id % 3) * 0.18]);
}
export function decide(s: StoreState, id: DecisionKind, accept: boolean) {
  const rec = s.recommendations.find((r) => r.id === id)!;
  if (rec.status !== "pending") return false;
  const employee = s.people.find(
    (p) => p.role === "employee" && p.id >= 102 && !p.taskId,
  );
  if (accept && id !== "meal" && !employee) return false;
  rec.status = accept ? "applied" : "declined";
  emit(
    s,
    "agents",
    `agent/${id}/${accept ? "approved" : "deferred"}`,
    accept ? rec.action : rec.alternative,
    id === "meal"
      ? "bakery"
      : id === "restock"
        ? "produce"
        : id === "checkout"
          ? "checkouts"
          : "pickup",
  );
  if (!accept) return true;
  if (id === "meal") {
    s.mealActive = true;
    for (const p of s.products.filter((p) => p.department === "bakery")) {
      p.price = Math.round(p.regularPrice * 0.8);
      emit(
        s,
        "pricing",
        `price/${p.id}/updated`,
        `${p.name} · €${(p.price / 100).toFixed(2)} on shelf, till & online`,
        "bakery",
      );
    }
  } else {
    const task: StaffTask = {
      id: `task-${id}`,
      kind: id,
      employeeId: employee!.id,
      stage: "source",
      timer: 0,
      productId: id === "restock" ? "sku-0" : "sku-12",
      cargo: [],
    };
    s.tasks.push(task);
    employee!.taskId = task.id;
    employee!.stage = "task";
    go(
      employee!,
      id === "restock"
        ? STOCKROOM
        : id === "checkout"
          ? [4, 7]
          : s.products[12].position,
    );
  }
  return true;
}
function staffStep(s: StoreState, p: Person, dt: number) {
  const task = s.tasks.find((t) => t.id === p.taskId);
  if (!task || task.stage === "complete") return;
  move(p, dt);
  if (p.route.length) return;
  task.timer += dt;
  if (task.timer < 2) return;
  task.timer = 0;
  if (task.stage === "source") {
    if (task.kind === "checkout") {
      s.checkouts[2] = true;
      s.operatingCosts += 2200;
      task.stage = "complete";
      p.stage = "working";
      p.checkout = 2;
      emit(
        s,
        "operations",
        "checkout/3/opened",
        "Checkout 3 is now serving shoppers.",
        "checkouts",
      );
      return;
    }
    const product = s.products.find(
      (product) => product.id === task.productId,
    )!;
    const picked = take(
      s,
      task.productId,
      task.kind === "restock" ? 18 : 1,
      task.kind === "restock" ? "backroom" : "shelf",
      "inTransit",
    );
    if (task.kind === "online" && !picked.length) return;
    task.cargo.push(...picked);
    if (
      task.kind === "online" &&
      task.cargo.reduce((n, l) => n + l.quantity, 0) < 4
    ) {
      const next =
        s.products[12 + task.cargo.reduce((n, l) => n + l.quantity, 0)];
      task.productId = next.id;
      go(p, next.position);
    } else {
      task.stage = "destination";
      go(p, task.kind === "restock" ? product.position : PICKUP);
    }
    emit(
      s,
      "inventory",
      `stock/${product.id}/picked`,
      `${task.kind === "restock" ? "Replenishment" : "Collection"} stock picked by a colleague.`,
      product.department,
    );
  } else {
    if (task.kind === "restock") {
      for (const l of task.cargo) {
        const b = s.batches.find((b) => b.id === l.batchId)!;
        b.inTransit -= l.quantity;
        b.shelf += l.quantity;
      }
      emit(
        s,
        "inventory",
        `stock/${task.productId}/replenished`,
        `${s.products.find((product) => product.id === task.productId)!.name} shelf replenished from the stockroom.`,
        s.products.find((product) => product.id === task.productId)!.department,
      );
    } else {
      settle(s, task.cargo, "online", "inTransit");
      s.onlineComplete++;
      emit(
        s,
        "operations",
        "order/collection/ready",
        "Collection order is packed, paid and ready.",
        "pickup",
      );
    }
    task.cargo = [];
    task.stage = "complete";
    p.taskId = undefined;
    p.stage = "working";
  }
}
export function advance(s: StoreState, dt: number) {
  s.time += dt;
  s.tick++;
  for (const p of s.people) {
    if (p.role === "employee") {
      staffStep(s, p, dt);
      continue;
    }
    move(p, dt);
    if (p.route.length) continue;
    p.timer -= dt;
    if (p.stage === "entering" && p.timer <= 0) shopNext(s, p);
    else if (p.stage === "shopping") {
      p.stage = "picking";
      p.timer = 1.8 + (p.id % 3) * 0.4;
    } else if (p.stage === "picking" && p.timer <= 0) {
      const product = s.products.find((v) => v.id === p.list[p.visited])!;
      const lines = take(s, product.id, 1, "shelf", "inBaskets");
      if (lines.length) {
        p.basket.push(...lines);
        s.fulfilled++;
        emit(
          s,
          "inventory",
          `stock/${product.id}/updated`,
          `${product.name} picked · ${stock(s, product.id).shelf} on shelf`,
          product.department,
        );
      } else {
        s.lostSales++;
        emit(
          s,
          "operations",
          `demand/${product.id}/unfilled`,
          `${product.name} shelf is empty; a shopper chose another aisle.`,
          product.department,
        );
      }
      p.visited++;
      shopNext(s, p);
    } else if (p.stage === "paying" && p.timer <= 0) {
      settle(s, p.basket, "till", "inBaskets");
      p.basket = [];
      p.stage = "leaving";
      go(p, ENTRY);
    } else if (p.stage === "leaving") {
      p.stage = "outside";
      p.timer = 3 + (p.id % 5);
    } else if (p.stage === "outside" && p.timer <= 0) {
      p.visited = 0;
      p.list = Array.from(
        { length: 3 },
        (_, n) =>
          s.products[
            s.mealActive && n === 0 && random(s) < 0.6
              ? 4 + Math.floor(random(s) * 4)
              : Math.floor(random(s) * 24)
          ].id,
      );
      p.stage = "entering";
      p.timer = 0.5;
      emit(
        s,
        "iot",
        "camera/entrance/entered",
        "A shopper entered the store.",
        "entrance",
      );
    }
  }
  for (let i = 0; i < 3; i++) {
    if (!s.checkouts[i]) continue;
    const queue = s.people
      .filter((p) => p.stage === "queueing" && p.checkout === i)
      .sort((a, b) => a.queueSince - b.queueSince || a.id - b.id);
    queue.forEach((p, n) => {
      const target: Point = [TILLS[i][0] + 1.8, 8.3 + n * 0.32];
      if (
        !p.route.length &&
        Math.hypot(p.position[0] - target[0], p.position[1] - target[1]) > 0.12
      )
        go(p, target);
    });
    if (
      !s.people.some((p) => p.stage === "paying" && p.checkout === i) &&
      queue[0] &&
      !queue[0].route.length
    ) {
      s.queueSamples.push(s.time - queue[0].queueSince);
      if (s.queueSamples.length > 100) s.queueSamples.shift();
      queue[0].stage = "paying";
      queue[0].timer = 4;
      emit(
        s,
        "operations",
        `checkout/${i + 1}/serving`,
        "A basket is being scanned.",
        "checkouts",
      );
    }
  }
  // Waiting shoppers can move to the newly opened checkout.
  if (s.checkouts[2]) {
    const counts = s.checkouts.map(
      (_, i) =>
        s.people.filter((p) => p.stage === "queueing" && p.checkout === i)
          .length,
    );
    if (counts[2] + 1 < Math.max(...counts)) {
      const p = s.people.find(
        (p) =>
          p.stage === "queueing" &&
          p.checkout === counts.indexOf(Math.max(...counts)),
      );
      if (p) {
        p.checkout = 2;
        p.route = [];
      }
    }
  }
  // Routine replenishment is delegated to two floor colleagues. Manager approvals
  // can prioritize work immediately instead of waiting for the routine stock round.
  if (s.time > 90)
    for (const colleague of s.people.filter((p) => p.id >= 106 && !p.taskId)) {
      const product = s.products.find(
        (product) =>
          stock(s, product.id).shelf < 5 &&
          stock(s, product.id).backroom > 0 &&
          !s.tasks.some(
            (t) => t.productId === product.id && t.stage !== "complete",
          ),
      );
      if (!product) break;
      const task: StaffTask = {
        id: `routine-${s.tick}-${colleague.id}`,
        kind: "restock",
        employeeId: colleague.id,
        stage: "source",
        timer: 0,
        productId: product.id,
        cargo: [],
      };
      s.tasks.push(task);
      colleague.taskId = task.id;
      colleague.stage = "task";
      go(colleague, STOCKROOM);
      emit(
        s,
        "agents",
        `agent/inventory/task-assigned`,
        `Routine replenishment assigned for ${product.name.toLowerCase()}.`,
        product.department,
      );
    }
  for (const b of s.batches)
    if (b.expiresAt <= s.time && b.shelf + b.backroom + b.receiving > 0) {
      const n = b.shelf + b.backroom + b.receiving;
      b.waste += n;
      b.shelf = b.backroom = b.receiving = 0;
      emit(
        s,
        "inventory",
        `batch/${b.id}/expired`,
        `${n} ${s.products.find((p) => p.id === b.productId)!.name.toLowerCase()} removed at expiry.`,
        s.products.find((p) => p.id === b.productId)!.department,
      );
    }
  if (Math.floor(s.time / 4) > Math.floor((s.time - dt) / 4)) {
    s.fridge = 3.6 + Math.sin(s.time * 0.15) * 0.25;
    emit(
      s,
      "iot",
      "fridge/fresh/temperature",
      `Chilled cabinet · ${s.fridge.toFixed(1)}°C · within range`,
      "fresh",
    );
    emit(
      s,
      "iot",
      "camera/entrance/occupancy",
      `${s.people.filter((p) => p.role === "shopper" && p.stage !== "outside").length} shoppers in store`,
      "entrance",
    );
  }
  if (Math.floor(s.time / 75) > s.deliveryCount) {
    s.deliveryCount++;
    const id = `delivery-${s.deliveryCount}`;
    s.batches.push({
      id,
      productId: "sku-0",
      received: 24,
      shelf: 0,
      backroom: 0,
      receiving: 24,
      inBaskets: 0,
      inTransit: 0,
      sold: 0,
      waste: 0,
      expiresAt: s.time + 3600,
    });
    emit(
      s,
      "inventory",
      "delivery/received",
      "24 apples checked in at receiving.",
      "receiving",
    );
  }
  if (s.time % 75 > 8)
    for (const b of s.batches.filter((b) => b.receiving > 0)) {
      b.backroom += b.receiving;
      b.receiving = 0;
      emit(
        s,
        "inventory",
        "delivery/stored",
        "Delivery moved into backroom stock.",
        "stockroom",
      );
    }
  return s;
}
export function metrics(s: StoreState) {
  const revenue = s.transactions.reduce((n, t) => n + t.revenue, 0),
    cost = s.transactions.reduce((n, t) => n + t.cost, 0),
    available = s.products.filter((p) => stock(s, p.id).shelf > 0).length,
    waste = s.batches.reduce((n, b) => n + b.waste, 0),
    sold = s.batches.reduce((n, b) => n + b.sold, 0),
    queue = s.people.filter((p) => p.stage === "queueing").length;
  return {
    revenue,
    profit: revenue - cost,
    margin: revenue ? ((revenue - cost) / revenue) * 100 : 0,
    availability: (available / 24) * 100,
    units: s.batches.reduce(
      (n, b) => n + b.shelf + b.backroom + b.receiving,
      0,
    ),
    waste,
    wasteRate: sold + waste ? (waste / (sold + waste)) * 100 : 0,
    queue,
    wait: queue
      ? s.people
          .filter((p) => p.stage === "queueing")
          .reduce((n, p) => n + s.time - p.queueSince, 0) / queue
      : s.queueSamples.length
        ? s.queueSamples.reduce((a, b) => a + b, 0) / s.queueSamples.length
        : 0,
    satisfaction: Math.round(
      Math.max(40, Math.min(100, 98 - s.lostSales * 1.2 - queue * 0.8)),
    ),
  };
}
export function evidence(s: StoreState, id: DecisionKind) {
  if (id === "restock") {
    const n = stock(s, "sku-0");
    return `${n.shelf} apples on the shelf · ${n.backroom} in the stockroom.`;
  }
  if (id === "checkout")
    return `${metrics(s).queue} shoppers waiting · ${s.checkouts.filter(Boolean).length} checkouts open.`;
  if (id === "meal") {
    const batches = s.batches.filter(
      (b) =>
        s.products.find((p) => p.id === b.productId)?.department === "bakery" &&
        b.shelf > 0,
    );
    const earliest = Math.min(...batches.map((b) => b.expiresAt));
    return `${batches.reduce((n, b) => n + b.shelf, 0)} bakery items on shelves · ${Number.isFinite(earliest) ? `first expiry in ${Math.max(0, Math.ceil((earliest - s.time) / 60))} min` : "shelf awaiting replenishment"}.`;
  }
  return "A four-item pantry order is waiting to be picked.";
}
