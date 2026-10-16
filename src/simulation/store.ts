/** One deterministic source of truth for the store, scene and event stream. */
export type Point = [number, number];
export type Category =
  "inventory" | "pricing" | "purchases" | "iot" | "agents" | "operations";
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
    position: [-12, -6],
    kind: "produce",
  },
  {
    id: "bakery",
    name: "Bakery",
    color: "#d4a265",
    position: [0, -6],
    kind: "bakery",
  },
  {
    id: "fresh",
    name: "Fresh & chilled",
    color: "#7dabb2",
    position: [12, -6],
    kind: "fridge",
  },
  {
    id: "pantry",
    name: "Pantry",
    color: "#d28b6c",
    position: [-12, 3],
    kind: "shelf",
  },
  {
    id: "drinks",
    name: "Drinks",
    color: "#a594b8",
    position: [0, 3],
    kind: "shelf",
  },
  {
    id: "home",
    name: "Home & care",
    color: "#89aaa0",
    position: [12, 3],
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
  onFloor: number;
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
  destination: Point | null;
  moving: boolean;
  blockedFor: number;
  stage:
    | "entering"
    | "shopping"
    | "picking"
    | "queueing"
    | "paying"
    | "leaving"
    | "outside"
    | "working"
    | "task"
    | "interacting";
  timer: number;
  basket: BasketLine[];
  list: string[];
  visited: number;
  checkout: number;
  queueSince: number;
  taskId?: string;
  activityId?: number;
  waveUntil?: number;
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
export type ActivityKind = "chat" | "dance" | "tidy" | "cleanup";
export interface StoreActivity {
  id: number;
  kind: ActivityKind;
  people: number[];
  target?: string;
  stage: "approaching" | "active" | "complete" | "cancelled";
  remaining: number;
  startedAt: number;
  deadline: number;
  line: string;
}
export interface FloorItem {
  id: number;
  batchId: string;
  productId: string;
  position: Point;
  at: number;
  status: "waiting" | "assigned" | "cleared";
  clearedAt?: number;
}
export type StoreCommand =
  | { type: "wave"; personId: number }
  | { type: "chat"; personId: number }
  | { type: "dance"; personId: number }
  | { type: "browse"; departmentId: string; personId?: number }
  | { type: "tidy"; departmentId: string; personId?: number }
  | { type: "wobble"; departmentId: string }
  | { type: "cleanup"; itemId: number };
export interface StoreState {
  time: number;
  seed: number;
  tick: number;
  people: Person[];
  products: Product[];
  batches: ProductBatch[];
  tasks: StaffTask[];
  activities: StoreActivity[];
  floorItems: FloorItem[];
  nextActivity: number;
  nextFloorItem: number;
  nextSocialAt: number;
  nextMishapAt: number;
  transactions: Transaction[];
  events: StoreEvent[];
  recommendations: Recommendation[];
  decisionLog: { id: DecisionKind; accepted: boolean; at: number }[];
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
  inventoryPolicy: "balanced" | "availability" | "lean";
  servicePolicy: "balanced" | "service" | "cost";
  freshPolicy: "balanced" | "waste" | "margin";
  fulfilmentPolicy: "balanced" | "online" | "instore";
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
export const SHOPPER_COUNT = 12;
export const STAFF_COUNT = 6;
export const PERSON_SPACING = 1.14;
export const FLOOR = { width: 42, depth: 36 };
export const FIXTURE_WIDTH = 8;
export const ENTRY: Point = [17, 17];
export const STOCKROOM: Point = [9, -13];
export const PICKUP: Point = [17, 9];
export const TILLS: Point[] = [
  [-12, 10],
  [-3, 10],
  [6, 10],
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
const OBSTACLES = [
  ...DEPARTMENTS.map((d) => [
    d.position[0],
    d.position[1],
    FIXTURE_WIDTH / 2 + 0.3,
    1.3,
  ]),
  ...TILLS.map((t) => [t[0], t[1], 1.6, 1.25]),
  [PICKUP[0], PICKUP[1] - 1.8, 2.05, 1.4],
  ...[5, 8.5, 12, 15.5].map((x) => [x, -14.8, 1.35, 1]),
  ...[-16, -13.4, -10.8].map((x) => [x, -14.8, 1.1, 1.05]),
];
function blocked(x: number, z: number) {
  return (
    x < -19.5 ||
    x > 19.5 ||
    z < -16 ||
    z > 17.5 ||
    OBSTACLES.some(
      ([cx, cz, hx, hz]) => Math.abs(x - cx) < hx && Math.abs(z - cz) < hz,
    )
  );
}
/** Continuous segment/rectangle clipping also catches very shallow corner cuts. */
function crossesFixture(start: Point, end: Point) {
  return OBSTACLES.some(([cx, cz, hx, hz]) => {
    let enter = 0,
      leave = 1;
    for (const [from, delta, min, max] of [
      [start[0], end[0] - start[0], cx - hx + 1e-8, cx + hx - 1e-8],
      [start[1], end[1] - start[1], cz - hz + 1e-8, cz + hz - 1e-8],
    ]) {
      if (Math.abs(delta) < 1e-10) {
        if (from < min || from > max) return false;
      } else {
        const a = (min - from) / delta,
          b = (max - from) / delta;
        enter = Math.max(enter, Math.min(a, b));
        leave = Math.min(leave, Math.max(a, b));
        if (enter >= leave) return false;
      }
    }
    return enter < leave;
  });
}
/** Routes avoid fixture footprints and occupied space, with half-metre lanes. */
export function routeBetween(
  start: Point,
  end: Point,
  occupied: Point[] = [],
): Point[] {
  const from: Point = [Math.round(start[0] * 2), Math.round(start[1] * 2)],
    to: Point = [Math.round(end[0] * 2), Math.round(end[1] * 2)];
  if (
    blocked(from[0] / 2, from[1] / 2) ||
    crossesFixture(start, [from[0] / 2, from[1] / 2])
  ) {
    const lanes: Point[] = [];
    for (let x = from[0] - 2; x <= from[0] + 2; x++)
      for (let z = from[1] - 2; z <= from[1] + 2; z++)
        if (!blocked(x / 2, z / 2) && !crossesFixture(start, [x / 2, z / 2]))
          lanes.push([x, z]);
    lanes.sort(
      (a, b) =>
        Math.hypot(a[0] / 2 - start[0], a[1] / 2 - start[1]) -
        Math.hypot(b[0] / 2 - start[0], b[1] / 2 - start[1]),
    );
    if (!lanes.length) return [];
    from[0] = lanes[0][0];
    from[1] = lanes[0][1];
  }
  const key = (p: Point) => `${p[0]},${p[1]}`;
  const taken = new Set<string>();
  for (const point of occupied)
    for (
      let x = Math.floor((point[0] - 1.2) * 2);
      x <= Math.ceil((point[0] + 1.2) * 2);
      x++
    )
      for (
        let z = Math.floor((point[1] - 1.2) * 2);
        z <= Math.ceil((point[1] + 1.2) * 2);
        z++
      )
        if (
          (x / 2 - point[0]) ** 2 + (z / 2 - point[1]) ** 2 <
          (PERSON_SPACING + 0.05) ** 2
        )
          taken.add(`${x},${z}`);
  if (taken.has(key(to)) || blocked(to[0] / 2, to[1] / 2)) return [];
  const dx = end[0] - start[0],
    dz = end[1] - start[1],
    forward: Point =
      Math.abs(dx) > Math.abs(dz)
        ? [Math.sign(dx) || 1, 0]
        : [0, Math.sign(dz) || 1],
    right: Point = [-forward[1], forward[0]];
  const directions = [
    forward,
    right,
    [-right[0], -right[1]],
    [-forward[0], -forward[1]],
  ];
  const heuristic = (p: Point) =>
    Math.abs(p[0] - to[0]) + Math.abs(p[1] - to[1]);
  const frontier = [{ point: from, score: heuristic(from) }],
    cost = new Map<string, number>([[key(from), 0]]),
    parents = new Map<string, Point | null>([[key(from), null]]),
    visited = new Set<string>();
  while (frontier.length) {
    frontier.sort((a, b) => b.score - a.score);
    const point = frontier.pop()!.point,
      id = key(point);
    if (visited.has(id)) continue;
    visited.add(id);
    if (id === key(to)) {
      const path: Point[] = [];
      let current: Point | null = point;
      while (current) {
        path.unshift([current[0] / 2, current[1] / 2]);
        current = parents.get(key(current)) ?? null;
      }
      if (Math.hypot(path[0][0] - start[0], path[0][1] - start[1]) < 1e-6)
        path.shift();
      path.push([...end]);
      return smoothRoute(start, path, occupied);
    }
    for (const [x, z] of directions) {
      const next: Point = [point[0] + x, point[1] + z],
        id = key(next),
        distance = cost.get(key(point))! + 1;
      if (
        !blocked(next[0] / 2, next[1] / 2) &&
        !taken.has(id) &&
        distance < (cost.get(id) ?? Infinity)
      ) {
        parents.set(id, point);
        cost.set(id, distance);
        frontier.push({ point: next, score: distance + heuristic(next) });
      }
    }
  }
  return [];
}
/** Long, clean walking segments replace the little half-metre grid turns. */
function smoothRoute(start: Point, path: Point[], occupied: Point[]) {
  const result: Point[] = [];
  let from = start,
    cursor = 0;
  while (cursor < path.length) {
    let last = cursor;
    for (let end = cursor; end < path.length; end++) {
      const target = path[end];
      const clear =
        !crossesFixture(from, target) &&
        occupied.every(
          (p) => segmentDistance(p, from, target) >= PERSON_SPACING + 0.04,
        );
      if (!clear) break;
      last = end;
    }
    result.push(path[last]);
    from = path[last];
    cursor = last + 1;
  }
  return result;
}
function otherPeople(s: StoreState, p: Person) {
  return s.people.filter(
    (other) => other.id !== p.id && other.stage !== "outside",
  );
}
function travelling(p: Person) {
  return (
    !!p.destination &&
    Math.hypot(
      p.position[0] - p.destination[0],
      p.position[1] - p.destination[1],
    ) > 0.04
  );
}
function go(s: StoreState, p: Person, end: Point, exact = false) {
  const others = otherPeople(s, p);
  const candidates: Point[] = exact
    ? [end]
    : [
        end,
        [end[0] + 1.3, end[1]],
        [end[0] - 1.3, end[1]],
        [end[0], end[1] + 1.3],
        [end[0] + 1.3, end[1] + 1.3],
        [end[0] - 1.3, end[1] + 1.3],
      ];
  const target =
    candidates.find(
      (candidate) =>
        !blocked(...candidate) &&
        others.every(
          (other) =>
            Math.hypot(
              other.position[0] - candidate[0],
              other.position[1] - candidate[1],
            ) >=
              PERSON_SPACING + 0.05 &&
            (!other.destination ||
              Math.hypot(
                other.destination[0] - candidate[0],
                other.destination[1] - candidate[1],
              ) >=
                PERSON_SPACING + 0.05),
        ),
    ) ?? end;
  p.destination = [...target];
  p.route = routeBetween(
    p.position,
    target,
    others.map((p) => p.position),
  );
  p.blockedFor = 0;
}
function segmentDistance(point: Point, start: Point, end: Point) {
  const dx = end[0] - start[0],
    dz = end[1] - start[1],
    length = dx * dx + dz * dz;
  const t = length
    ? Math.max(
        0,
        Math.min(
          1,
          ((point[0] - start[0]) * dx + (point[1] - start[1]) * dz) / length,
        ),
      )
    : 0;
  return Math.hypot(point[0] - start[0] - t * dx, point[1] - start[1] - t * dz);
}
function clearStep(s: StoreState, p: Person, end: Point) {
  return (
    !blocked(...end) &&
    !crossesFixture(p.position, end) &&
    otherPeople(s, p).every(
      (other) =>
        segmentDistance(other.position, p.position, end) >=
        PERSON_SPACING - 1e-6,
    )
  );
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
      position: [d.position[0] + ((i % 4) - 1.5) * 1.8, d.position[1] + 2],
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
        onFloor: 0,
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
    activities: [],
    floorItems: [],
    nextActivity: 1,
    nextFloorItem: 1,
    nextSocialAt: 14,
    nextMishapAt: 24,
    transactions: [],
    events: [],
    decisionLog: [],
    recommendations: [
      {
        id: "restock",
        title: "Availability or leaner stock?",
        agent: "Inventory agent",
        action: "Protect product availability",
        alternative: "Keep stock lean",
        consequence:
          "Agents keep a larger shelf buffer across every department and coordinate routine replenishment themselves.",
        tradeoff:
          "Fewer empty shelves, but more stock on the floor and more exposure to fresh-food waste.",
        status: "pending",
      },
      {
        id: "checkout",
        title: "Service or lower operating costs?",
        agent: "Store operations agent",
        action: "Invest in customer service",
        alternative: "Hold operating costs",
        consequence:
          "Give agents a staffing budget to add checkout capacity and keep queues moving.",
        tradeoff:
          "The extra capacity costs €22 and takes a colleague away from other store work.",
        status: "pending",
      },
      {
        id: "meal",
        title: "Protect margin or reduce food waste?",
        agent: "Fresh food agent",
        action: "Favor lower food waste",
        alternative: "Protect full-price margin",
        consequence:
          "Let agents use a 20% deal on bakery items approaching expiry, with shelf, checkout and online prices kept in sync.",
        tradeoff:
          "More chance of selling fresh food in time, but less profit on each discounted item.",
        status: "pending",
      },
      {
        id: "online",
        title: "Online promises or in-store capacity?",
        agent: "Order fulfilment agent",
        action: "Prioritize online promises",
        alternative: "Prioritize in-store shoppers",
        consequence:
          "Agents give collection orders first call on available colleagues and stock, and coordinate picking and handover.",
        tradeoff:
          "Online customers get their order sooner; fewer resources remain available for people shopping in the store.",
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
    inventoryPolicy: "balanced",
    servicePolicy: "balanced",
    freshPolicy: "balanced",
    fulfilmentPolicy: "balanced",
  };
  for (let i = 0; i < SHOPPER_COUNT; i++) {
    const p: Person = {
      id: i,
      role: "shopper",
      position: [...ENTRY],
      route: [],
      destination: null,
      moving: false,
      blockedFor: 0,
      stage: "entering",
      timer: 2 + i * 1.7,
      basket: [],
      list: [],
      visited: 0,
      checkout: 0,
      queueSince: 0,
      outfit: outfits[i % outfits.length],
      skin: skins[i % skins.length],
    };
    p.list = shoppingList(s, i);
    if (i < 8) {
      const product = products.find((product) => product.id === p.list[0])!;
      p.position = [
        product.position[0],
        product.position[1] + (i >= 6 ? 1.5 : 0),
      ];
      p.stage = "picking";
      p.timer = 0.7 + (i % 4);
    }
    if (i >= 8 && i < 10) {
      p.position = [TILLS[i % 2][0] + 1.8, TILLS[i % 2][1] + 2 + (i % 3) * 0.6];
      for (const productId of p.list.slice(0, 2))
        p.basket.push(...take(s, productId, 1, "shelf", "inBaskets"));
      p.visited = p.list.length;
      joinQueue(s, p);
    }
    if (i >= 10) p.stage = "outside";
    s.people.push(p);
  }
  for (let i = 0; i < STAFF_COUNT; i++)
    s.people.push({
      id: 100 + i,
      role: "employee",
      position:
        i < 2 ? [TILLS[i][0], TILLS[i][1] - 1.5] : [-15 + (i - 2) * 10, -11],
      route: [],
      destination: null,
      moving: false,
      blockedFor: 0,
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
    "Paris Flagship is open. A relaxed shop floor with 12 shoppers and 6 colleagues.",
  );
  emit(
    s,
    "agents",
    "agent/recommendation/created",
    "Two priorities at a time. Your agents handle the details.",
  );
  return s;
}
function move(s: StoreState, p: Person, dt: number) {
  p.moving = false;
  if (p.stage === "outside" || !travelling(p)) return;
  if (!p.route.length)
    p.route = routeBetween(
      p.position,
      p.destination!,
      otherPeople(s, p).map((p) => p.position),
    );
  let budget = dt * (p.role === "employee" ? 1.95 : 1.5 + (p.id % 4) * 0.07);
  while (p.route.length && budget > 0) {
    const next = p.route[0],
      dx = next[0] - p.position[0],
      dz = next[1] - p.position[1],
      distance = Math.hypot(dx, dz);
    if (distance < 0.001) {
      p.route.shift();
      continue;
    }
    const step = Math.min(budget, distance),
      candidate: Point = [
        p.position[0] + (dx / distance) * step,
        p.position[1] + (dz / distance) * step,
      ];
    if (!clearStep(s, p, candidate)) break;
    p.position = candidate;
    p.moving = true;
    budget -= step;
    if (step >= distance - 0.0001) p.route.shift();
  }
  if (p.moving) {
    p.blockedFor = 0;
    return;
  }
  p.blockedFor += dt;
  if (p.blockedFor < 0.6) return;
  const target = p.route[0] ?? p.destination!,
    dx = target[0] - p.position[0],
    dz = target[1] - p.position[1],
    length = Math.hypot(dx, dz) || 1;
  // Walk to the right to pass oncoming shoppers, instead of pushing through them.
  for (const direction of [1, -1]) {
    const step: Point = [
      p.position[0] - (dz / length) * 0.14 * direction,
      p.position[1] + (dx / length) * 0.14 * direction,
    ];
    if (clearStep(s, p, step)) {
      p.position = step;
      p.moving = true;
      break;
    }
  }
  p.route = routeBetween(
    p.position,
    p.destination!,
    otherPeople(s, p).map((p) => p.position),
  );
  p.blockedFor = 0;
}
function patrol(s: StoreState, p: Person, dt: number) {
  if (p.id < 102 || p.taskId) return;
  if (travelling(p)) return;
  p.timer -= dt;
  if (p.timer > 0) return;
  p.visited++;
  const product =
    s.products[((p.id - 102) * 5 + p.visited * 7) % s.products.length];
  go(s, p, product.position);
  p.timer = 1.6;
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
  p.route = [];
  p.destination = null;
  p.queueSince = s.time;
}
function shoppingList(s: StoreState, id: number) {
  const trip = Math.floor(s.time / 60),
    start = (id + trip) % 6;
  const order = [0, 3, 1, 4, 2, 5];
  const count = id % 3 === 0 ? 6 : 4;
  const list = Array.from({ length: count }, (_, n) => {
    const department = order[(start + n) % 6];
    return s.products[
      department * 4 + ((Math.floor(id / 6) * 2 + id + n + trip) % 4)
    ].id;
  });
  if (s.mealActive && random(s) < 0.7) list[0] = s.products[4 + (id % 4)].id;
  return list;
}
export function visibleRecommendations(s: StoreState) {
  const order: DecisionKind[] = ["restock", "meal", "checkout", "online"];
  return order
    .map((id) => s.recommendations.find((r) => r.id === id)!)
    .filter((r) => r.status === "pending")
    .slice(0, 2);
}
function shopNext(s: StoreState, p: Person) {
  if (p.visited >= p.list.length) {
    joinQueue(s, p);
    return;
  }
  const product = s.products.find((v) => v.id === p.list[p.visited])!;
  p.stage = "shopping";
  go(s, p, [product.position[0], product.position[1] + (p.id % 3) * 0.18]);
}
export function decide(s: StoreState, id: DecisionKind, accept: boolean) {
  const rec = s.recommendations.find((r) => r.id === id)!;
  if (rec.status !== "pending") return false;
  rec.status = accept ? "applied" : "declined";
  s.decisionLog.push({ id, accepted: accept, at: s.time });
  if (id === "restock") s.inventoryPolicy = accept ? "availability" : "lean";
  if (id === "checkout") s.servicePolicy = accept ? "service" : "cost";
  if (id === "online") s.fulfilmentPolicy = accept ? "online" : "instore";
  if (id === "meal") {
    s.freshPolicy = accept ? "waste" : "margin";
    s.mealActive = accept;
    if (accept)
      for (const product of s.products.filter(
        (p) => p.department === "bakery",
      )) {
        product.price = Math.round(product.regularPrice * 0.8);
        emit(
          s,
          "pricing",
          `price/${product.id}/updated`,
          `${product.name} · €${(product.price / 100).toFixed(2)} on shelf, till & online`,
          "bakery",
        );
      }
  }
  emit(
    s,
    "agents",
    `strategy/${id}/updated`,
    accept ? rec.action : rec.alternative,
    id === "meal"
      ? "bakery"
      : id === "restock"
        ? "produce"
        : id === "checkout"
          ? "checkouts"
          : "pickup",
  );
  if (id === "meal" && accept) {
    // A live bakery promotion changes actual shopping routes, never stock or revenue by fiat.
    const interested = s.people
      .filter(
        (p) =>
          p.role === "shopper" &&
          (p.stage === "shopping" || p.stage === "picking"),
      )
      .sort(
        (a, b) =>
          Math.hypot(a.position[0], a.position[1] + 4) -
          Math.hypot(b.position[0], b.position[1] + 4),
      )
      .slice(0, 2);
    interested.forEach((p, i) => {
      p.list.splice(p.visited, 0, s.products[4 + i].id);
      shopNext(s, p);
    });
    emit(
      s,
      "operations",
      "promotion/bakery/engaged",
      `${interested.length} shoppers are heading to the bakery deal.`,
      "bakery",
    );
  }
  dispatchWork(s);
  return true;
}
function assignTask(
  s: StoreState,
  kind: "restock" | "checkout" | "online",
  productId: string,
  id: string,
) {
  const person = s.people.find(
    (p) => p.role === "employee" && p.id >= 102 && !p.taskId && !p.activityId,
  );
  if (!person) return false;
  const task: StaffTask = {
    id,
    kind,
    productId,
    employeeId: person.id,
    stage: "source",
    timer: 0,
    cargo: [],
  };
  s.tasks.push(task);
  person.taskId = id;
  person.stage = "task";
  go(
    s,
    person,
    kind === "restock"
      ? STOCKROOM
      : kind === "checkout"
        ? [TILLS[2][0], TILLS[2][1] - 1.5]
        : s.products.find((p) => p.id === productId)!.position,
  );
  return true;
}
function dispatchWork(s: StoreState) {
  if (
    s.servicePolicy === "service" &&
    !s.checkouts[2] &&
    !s.tasks.some((t) => t.kind === "checkout")
  )
    assignTask(s, "checkout", "sku-0", "task-checkout");
  if (
    s.fulfilmentPolicy === "online" &&
    !s.onlineComplete &&
    !s.tasks.some((t) => t.kind === "online")
  )
    assignTask(s, "online", "sku-12", "task-online");
  if (s.time < 3 && s.inventoryPolicy !== "availability") return;
  const threshold =
    s.inventoryPolicy === "availability"
      ? 9
      : s.inventoryPolicy === "lean"
        ? 3
        : 5;
  while (
    s.tasks.filter((t) => t.kind === "restock" && t.stage !== "complete")
      .length < 2
  ) {
    const product = s.products.find(
      (p) =>
        stock(s, p.id).shelf < threshold &&
        stock(s, p.id).backroom > 0 &&
        !s.tasks.some((t) => t.productId === p.id && t.stage !== "complete"),
    );
    if (
      !product ||
      !assignTask(
        s,
        "restock",
        product.id,
        `routine-${s.tick}-${s.tasks.length}`,
      )
    )
      break;
    emit(
      s,
      "agents",
      "agent/inventory/task-assigned",
      `Agents arranged routine replenishment for ${product.name.toLowerCase()}.`,
      product.department,
    );
  }
}
function staffStep(s: StoreState, p: Person, dt: number) {
  const task = s.tasks.find((t) => t.id === p.taskId);
  if (!task || task.stage === "complete") return;
  if (travelling(p)) return;
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
      go(s, p, next.position);
    } else {
      task.stage = "destination";
      go(s, p, task.kind === "restock" ? product.position : PICKUP);
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
    move(s, p, dt);
    if (p.activityId) continue;
    if (p.role === "employee") {
      staffStep(s, p, dt);
      patrol(s, p, dt);
      continue;
    }
    if (travelling(p)) continue;
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
      go(s, p, ENTRY, true);
    } else if (p.stage === "leaving") {
      p.stage = "outside";
      p.timer = 3 + (p.id % 5);
    } else if (p.stage === "outside" && p.timer <= 0) {
      if (
        otherPeople(s, p).some(
          (other) =>
            Math.hypot(
              other.position[0] - ENTRY[0],
              other.position[1] - ENTRY[1],
            ) < 1.8 ||
            (other.stage === "leaving" &&
              travelling(other) &&
              Math.hypot(
                other.position[0] - ENTRY[0],
                other.position[1] - ENTRY[1],
              ) < 3),
        )
      )
        continue;
      p.position = [...ENTRY];
      p.destination = null;
      p.visited = 0;
      p.list = shoppingList(s, p.id);
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
  activityStep(s, dt);
  for (let i = 0; i < 3; i++) {
    if (!s.checkouts[i]) continue;
    const queue = s.people
      .filter((p) => p.stage === "queueing" && p.checkout === i)
      .sort((a, b) => a.queueSince - b.queueSince || a.id - b.id);
    queue.forEach((p, n) => {
      const target: Point = [
        TILLS[i][0] + 1.8 + (n >= 4 ? 1.3 : 0),
        TILLS[i][1] + 1.6 + Math.min(n, 7 - n) * 1.16,
      ];
      if (
        !p.destination ||
        Math.hypot(p.destination[0] - target[0], p.destination[1] - target[1]) >
          0.1
      )
        go(s, p, target, true);
    });
    if (
      !s.people.some((p) => p.stage === "paying" && p.checkout === i) &&
      queue[0] &&
      !travelling(queue[0])
    ) {
      s.queueSamples.push(s.time - queue[0].queueSince);
      if (s.queueSamples.length > 100) s.queueSamples.shift();
      queue[0].stage = "paying";
      queue[0].timer = 4;
      go(s, queue[0], [TILLS[i][0] + 1.8, TILLS[i][1] + 0.3], true);
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
        p.destination = null;
      }
    }
  }
  dispatchWork(s);
  ambientStep(s);
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
      onFloor: 0,
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
    const low = s.products.filter((p) => stock(s, p.id).shelf < 9).length;
    return `${metrics(s).availability.toFixed(0)}% product availability · ${low} ${low === 1 ? "shelf" : "shelves"} below a comfortable buffer.`;
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
  return `${s.onlineComplete ? "Collection promise met" : "An online order is waiting"} · ${metrics(s).queue} shoppers waiting in store.`;
}

/** Human-readable progress comes from completed physical work, not a second animation timer. */
export function decisionImpact(s: StoreState, id: DecisionKind) {
  const choice = s.decisionLog.find((d) => d.id === id);
  if (!choice) return "";
  if (id === "meal")
    return choice.accepted
      ? "Bakery prices −20%. Shoppers are visiting the deal."
      : "Bakery stays at full price. More margin per item, with expiry risk.";
  if (id === "checkout")
    return choice.accepted
      ? s.checkouts[2]
        ? "Checkout 3 is open. Shoppers can use the extra lane."
        : s.tasks.some((t) => t.kind === "checkout" && t.stage !== "complete")
          ? "A colleague is walking to checkout 3 to open it."
          : "Service budget approved. A colleague will open checkout 3 after their current task."
      : "Two checkouts stay open. The extra staffing budget is saved.";
  if (id === "online")
    return choice.accepted
      ? s.onlineComplete
        ? "The collection order is packed, paid and on the counter."
        : s.tasks.some((t) => t.kind === "online" && t.stage !== "complete")
          ? "A colleague is picking four items for the collection point."
          : "The order is queued. A colleague will pick it when available."
      : "Floor colleagues stay with in-store shoppers and shelf work.";
  if (!choice.accepted)
    return "Smaller shelf buffers. Colleagues refill only when stock gets low.";
  const task = s.tasks.find((t) => t.kind === "restock");
  if (!task)
    return "Larger shelf buffers are active. Agents refill departments as stock dips.";
  return task?.stage === "complete"
    ? "The first shelf is refilled. Agents keep the larger stock buffer."
    : task?.stage === "destination"
      ? "A colleague is carrying stock from the backroom to the shelf."
      : "A colleague is heading to the stockroom for more shelf stock.";
}

const SHOPPER_NAMES = [
  "Mia",
  "Theo",
  "Léa",
  "Noah",
  "Amira",
  "Jules",
  "Sofia",
  "Oscar",
  "Inès",
  "Leo",
  "Zoe",
  "Hugo",
];
const STAFF_NAMES = ["Amina", "Louis", "Camille", "Alex", "Sam", "Robin"];
export function personName(p: Person) {
  return p.role === "shopper"
    ? SHOPPER_NAMES[p.id % SHOPPER_NAMES.length]
    : STAFF_NAMES[(p.id - 100) % STAFF_NAMES.length];
}
export function personActivity(s: StoreState, p: Person) {
  const a = s.activities.find((a) => a.id === p.activityId);
  if (a)
    return a.stage === "approaching"
      ? a.kind === "chat"
        ? "Going to say hello"
        : a.kind === "cleanup"
          ? "Going to collect a dropped item"
          : a.kind === "dance"
            ? "Ready for a little dance"
            : "Walking to the display"
      : a.kind === "chat"
        ? "Having a friendly chat"
        : a.kind === "dance"
          ? "Doing a little happy dance"
          : a.kind === "cleanup"
            ? "Picking up the dropped item"
            : "Straightening the display";
  const task = s.tasks.find((t) => t.id === p.taskId && t.stage !== "complete");
  if (task)
    return task.kind === "restock"
      ? "Bringing stock to the shelves"
      : task.kind === "online"
        ? "Picking a collection order"
        : "Opening checkout 3";
  return {
    entering: "Just arrived",
    shopping: "Exploring the aisles",
    picking: "Choosing groceries",
    queueing: "Waiting for a checkout",
    paying: "Paying for groceries",
    leaving: "Heading home",
    outside: "Out for a moment",
    working:
      p.id < 102 || p.taskId ? "Serving a checkout" : "Looking after the shop",
    task: "Helping the shop",
    interacting: "Enjoying a little moment",
  }[p.stage];
}
function canPlay(p: Person) {
  return (
    !p.activityId &&
    !p.taskId &&
    (p.role === "shopper"
      ? ["shopping", "picking", "entering"].includes(p.stage)
      : p.id >= 102 && p.stage === "working")
  );
}
function beginActivity(
  s: StoreState,
  kind: ActivityKind,
  people: Person[],
  target?: string,
  line = "",
) {
  if (people.some((p) => !canPlay(p))) return null;
  const activity: StoreActivity = {
    id: s.nextActivity++,
    kind,
    people: people.map((p) => p.id),
    target,
    stage: "approaching",
    remaining: kind === "chat" ? 5 : kind === "dance" ? 3 : 3.5,
    startedAt: s.time,
    deadline: s.time + 35,
    line,
  };
  s.activities.push(activity);
  for (const p of people) {
    p.activityId = activity.id;
    p.stage = "interacting";
    p.route = [];
    p.destination = null;
    p.moving = false;
  }
  return activity;
}
function finishActivity(s: StoreState, a: StoreActivity, cancelled = false) {
  a.stage = cancelled ? "cancelled" : "complete";
  if (a.kind === "cleanup") {
    const item = s.floorItems.find((i) => String(i.id) === a.target);
    if (item && item.status !== "cleared") {
      if (cancelled) item.status = "waiting";
      else {
        const batch = s.batches.find((b) => b.id === item.batchId)!;
        const product = s.products.find((p) => p.id === item.productId)!;
        batch.onFloor--;
        const wasted =
          ["produce", "bakery"].includes(product.department) ||
          batch.expiresAt <= s.time;
        if (wasted) batch.waste++;
        else batch.shelf++;
        item.status = "cleared";
        item.clearedAt = s.time;
        emit(
          s,
          "inventory",
          `smartstore/floor/${item.id}/cleared`,
          `${personName(s.people.find((p) => p.id === a.people[0])!)} cleared the aisle. ${product.name} ${wasted ? "recorded as waste" : "returned to the display"}.`,
          product.department,
        );
      }
    }
  } else if (!cancelled && a.kind === "tidy")
    emit(
      s,
      "operations",
      `display/${a.target}/tidied`,
      "A colleague straightened the display. Looking lovely!",
      a.target,
    );
  else if (!cancelled && a.kind === "chat")
    emit(
      s,
      "operations",
      "people/conversation/finished",
      "A friendly chat, then back to the shopping.",
      `person:${a.people[0]}`,
    );
  for (const id of a.people) {
    const p = s.people.find((p) => p.id === id)!;
    p.activityId = undefined;
    p.destination = null;
    p.route = [];
    if (p.role === "shopper") shopNext(s, p);
    else {
      p.stage = "working";
      p.timer = 0;
    }
  }
}
function activityStep(s: StoreState, dt: number) {
  for (const a of s.activities.filter(
    (a) => a.stage === "active" || a.stage === "approaching",
  )) {
    const people = a.people.map((id) => s.people.find((p) => p.id === id)!);
    if (a.stage === "approaching") {
      if (s.time > a.deadline) {
        finishActivity(s, a, true);
        continue;
      }
      if (people.some((p) => travelling(p))) continue;
      a.stage = "active";
      emit(
        s,
        "operations",
        `people/${a.kind}/started`,
        a.kind === "chat"
          ? `${people.map(personName).join(" and ")} stopped for a friendly chat.`
          : a.kind === "dance"
            ? `${personName(people[0])} found their favourite tune!`
            : `${personName(people[0])} is ${a.kind === "cleanup" ? "clearing the aisle" : "tidying the display"}.`,
        a.target ?? `person:${people[0].id}`,
      );
    }
    a.remaining -= dt;
    if (a.remaining <= 0) finishActivity(s, a);
  }
  // Bound completed visual history while retaining every live activity and floor unit.
  s.activities = s.activities.filter(
    (a) =>
      a.stage === "active" ||
      a.stage === "approaching" ||
      s.time - a.startedAt < 60,
  );
  s.floorItems = s.floorItems.filter(
    (i) => i.status !== "cleared" || s.time - (i.clearedAt ?? s.time) < 10,
  );
}
function startChat(s: StoreState, p: Person, nearbyOnly = false) {
  if (!canPlay(p)) return false;
  const partner = s.people
    .filter(
      (o) =>
        o.id !== p.id &&
        canPlay(o) &&
        (!nearbyOnly ||
          Math.hypot(
            o.position[0] - p.position[0],
            o.position[1] - p.position[1],
          ) < 7),
    )
    .sort(
      (a, b) =>
        Math.hypot(
          a.position[0] - p.position[0],
          a.position[1] - p.position[1],
        ) -
        Math.hypot(
          b.position[0] - p.position[0],
          b.position[1] - p.position[1],
        ),
    )[0];
  if (!partner) return false;
  const spots: Point[] = [
    [1.7, 0],
    [-1.7, 0],
    [0, 1.7],
    [0, -1.7],
  ].map(([x, z]) => [partner.position[0] + x, partner.position[1] + z]);
  const spot = spots.find(
    (spot) =>
      !blocked(...spot) &&
      s.people
        .filter((o) => o.id !== p.id && o.stage !== "outside")
        .every(
          (o) =>
            Math.hypot(o.position[0] - spot[0], o.position[1] - spot[1]) >=
            PERSON_SPACING + 0.08,
        ) &&
      routeBetween(
        p.position,
        spot,
        otherPeople(s, p).map((o) => o.position),
      ).length,
  );
  if (!spot) return false;
  const lines = [
    "Tea or coffee?",
    "Those croissants!",
    "Lovely weather!",
    "Found a good deal?",
    "Nice basket!",
  ];
  const a = beginActivity(
    s,
    "chat",
    [p, partner],
    undefined,
    lines[Math.floor(random(s) * lines.length)],
  );
  if (!a) return false;
  go(s, p, spot, true);
  return true;
}
function dropItem(s: StoreState, departmentId: string) {
  if (s.floorItems.filter((i) => i.status !== "cleared").length >= 2)
    return false;
  const products = s.products.filter(
    (p) => p.department === departmentId && stock(s, p.id).shelf > 0,
  );
  if (!products.length) return false;
  const product = products[Math.floor(random(s) * products.length)];
  const batch = s.batches.find(
    (b) => b.productId === product.id && b.shelf > 0 && b.expiresAt > s.time,
  );
  if (!batch) return false;
  batch.shelf--;
  batch.onFloor++;
  const item: FloorItem = {
    id: s.nextFloorItem++,
    batchId: batch.id,
    productId: product.id,
    position: [product.position[0] + 0.45, product.position[1] + 0.35],
    at: s.time,
    status: "waiting",
  };
  s.floorItems.push(item);
  emit(
    s,
    "iot",
    `smartstore/floor/${item.id}/detected`,
    `Oops! ${product.name} took a tumble. The store sensor flagged it for cleanup.`,
    departmentId,
  );
  emit(
    s,
    "inventory",
    `stock/${product.id}/floor-updated`,
    "One item moved from shelf stock to the floor; saleable stock updated.",
    departmentId,
  );
  return true;
}
function requestCleanup(s: StoreState, item: FloorItem) {
  if (item.status !== "waiting") return false;
  const colleague = s.people
    .filter((p) => p.role === "employee" && canPlay(p))
    .sort(
      (a, b) =>
        Math.hypot(
          a.position[0] - item.position[0],
          a.position[1] - item.position[1],
        ) -
        Math.hypot(
          b.position[0] - item.position[0],
          b.position[1] - item.position[1],
        ),
    )[0];
  if (!colleague) return false;
  const a = beginActivity(
    s,
    "cleanup",
    [colleague],
    String(item.id),
    "I've got it!",
  );
  if (!a) return false;
  item.status = "assigned";
  go(s, colleague, item.position);
  emit(
    s,
    "agents",
    `smartstore/floor/${item.id}/cleanup-assigned`,
    `${personName(colleague)} is on the way to tidy the aisle.`,
    s.products.find((p) => p.id === item.productId)!.department,
  );
  return true;
}
export function interact(
  s: StoreState,
  command: StoreCommand,
): { ok: boolean; message: string } {
  const p =
    "personId" in command
      ? s.people.find((p) => p.id === command.personId)
      : undefined;
  if (command.type === "wave") {
    if (!p || p.stage === "outside")
      return { ok: false, message: "They are outside just now." };
    p.waveUntil = s.time + 3;
    emit(
      s,
      "operations",
      `people/${p.id}/waved`,
      `${personName(p)} says hello!`,
      `person:${p.id}`,
    );
    return { ok: true, message: `${personName(p)} says hello!` };
  }
  if (command.type === "chat") {
    const ok = !!p && startChat(s, p);
    return {
      ok,
      message: ok
        ? "A friendly chat is on the way."
        : "They are busy. Try a shopper browsing an aisle.",
    };
  }
  if (command.type === "dance") {
    const ok =
      !!p && !!beginActivity(s, "dance", [p], undefined, "Happy feet!");
    return {
      ok,
      message: ok
        ? "A tiny dance break!"
        : "Let them finish their current job first.",
    };
  }
  if (command.type === "wobble") {
    const ok = dropItem(s, command.departmentId);
    return {
      ok,
      message: ok
        ? "Oops! Watch the tidy-up crew."
        : "Let's clear the current mishaps before another wobble.",
    };
  }
  if (command.type === "cleanup") {
    const item = s.floorItems.find((i) => i.id === command.itemId);
    const ok = !!item && requestCleanup(s, item);
    return {
      ok,
      message: ok
        ? "A colleague is on the way to help."
        : item?.status === "assigned"
          ? "A colleague is already on the way."
          : "The team will help as soon as a colleague is free.",
    };
  }
  const department = DEPARTMENTS.find((d) => d.id === command.departmentId);
  if (!department) return { ok: false, message: "Choose a department first." };
  const candidates = s.people.filter(
    (person) =>
      canPlay(person) &&
      (command.type === "browse"
        ? person.role === "shopper"
        : person.role === "employee") &&
      (command.personId === undefined || person.id === command.personId),
  );
  candidates.sort(
    (a, b) =>
      Math.hypot(
        a.position[0] - department.position[0],
        a.position[1] - department.position[1],
      ) -
      Math.hypot(
        b.position[0] - department.position[0],
        b.position[1] - department.position[1],
      ),
  );
  const actor = candidates[0];
  if (!actor)
    return {
      ok: false,
      message: "Everyone is busy just now. Try again in a moment.",
    };
  if (command.type === "browse") {
    if (actor.list.length > 10)
      return { ok: false, message: "Let them finish a little shopping first." };
    const product = s.products.find(
      (p) => p.department === department.id && stock(s, p.id).shelf > 0,
    );
    if (!product)
      return { ok: false, message: "This shelf is awaiting fresh stock." };
    actor.list.splice(actor.visited, 0, product.id);
    shopNext(s, actor);
    emit(
      s,
      "operations",
      `people/${actor.id}/browsing`,
      `${personName(actor)} is heading to ${department.name.toLowerCase()}.`,
      department.id,
    );
  } else {
    if (!beginActivity(s, "tidy", [actor], department.id, "Looking lovely!"))
      return { ok: false, message: "They are busy." };
    go(s, actor, [department.position[0], department.position[1] + 2]);
  }
  return {
    ok: true,
    message: `${personName(actor)} is on the way to ${department.name.toLowerCase()}.`,
  };
}
function ambientStep(s: StoreState) {
  if (s.time >= s.nextSocialAt) {
    if (
      s.activities.filter(
        (a) => a.stage === "active" || a.stage === "approaching",
      ).length < 2
    ) {
      const people = s.people.filter((p) => canPlay(p));
      if (people.length)
        startChat(s, people[Math.floor(random(s) * people.length)], true);
    }
    s.nextSocialAt = s.time + 18 + random(s) * 12;
  }
  if (s.time >= s.nextMishapAt) {
    const person = s.people.find((p) => p.stage === "picking");
    const product =
      person && s.products.find((v) => v.id === person.list[person.visited]);
    dropItem(
      s,
      product?.department ??
        DEPARTMENTS[Math.floor(random(s) * DEPARTMENTS.length)].id,
    );
    s.nextMishapAt = s.time + 35 + random(s) * 20;
  }
  for (const item of s.floorItems)
    if (item.status === "waiting") requestCleanup(s, item);
}
