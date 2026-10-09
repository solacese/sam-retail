import type { AgentId, Effect, Family, SituationTemplate } from "./types";
export const AGENTS: Record<
  AgentId,
  { role: string; color: string; motto: string }
> = {
  SAM: {
    role: "General Manager",
    color: "#bca2f5",
    motto: "Helping store teams work together.",
  },
  STOCKY: {
    role: "Inventory Agent",
    color: "#67d8bd",
    motto: "Keeping products available.",
  },
  PENNY: {
    role: "Finance Agent",
    color: "#f6c76d",
    motto: "Keeping costs and cash under control.",
  },
  SHIELD: {
    role: "Security Agent",
    color: "#86b7ed",
    motto: "Protecting stock, payments, and customers.",
  },
  SPARK: {
    role: "Marketing Agent",
    color: "#f29ba4",
    motto: "Helping customers find reasons to return.",
  },
};
type Copy = [
  title: string,
  situation: string,
  recommendation: string,
  approve: string,
  reject: string,
];
const COPY: Record<Family, Copy[]> = {
  "stock": [
    [
      "Milk before the rush",
      "Solace shares rising milk sales with Stocky and Penny. Extra supply costs more; the usual truck may arrive in time.",
      "order extra milk while keeping cash for other bills.",
      "Order extra milk",
      "Wait for the truck"
    ],
    [
      "Online orders jump",
      "Solace updates shelf and online stock together. Pasta demand is rising, but no one knows how long the rush will last.",
      "order more pasta for shelves and online orders.",
      "Order more pasta",
      "Sell what we have"
    ],
    [
      "Fruit for the evening",
      "Solace sends live fruit sales to the buying bots. Extra pallets prevent shortages, but tomorrow may be quiet.",
      "buy an extra pallet of fruit before the evening rush.",
      "Order extra fruit",
      "Wait for normal supply"
    ],
    [
      "Breakfast stock alert",
      "Solace flags low breakfast stock before it runs out. A rush delivery is costly; substitutes are already available.",
      "refill the breakfast range with a rush delivery.",
      "Refill the range",
      "Offer substitutes"
    ],
    [
      "Essentials in demand",
      "Solace gives every stock bot the same live demand. More essentials protect availability, but tie up cash needed elsewhere.",
      "rush the essentials customers need most.",
      "Rush the essentials",
      "Keep cash available"
    ],
    [
      "Reserve stock for pickup",
      "Solace keeps pickup and shelf stock in sync. More pickup orders may come, but the final count is still unknown.",
      "buy extra stock to serve pickup and walk-in customers.",
      "Buy extra stock",
      "Use current stock"
    ]
  ],
  "supplier": [
    [
      "A larger dairy order",
      "Solace brings the supplier offer and storage forecast to both bots. A full truck costs less per item, but needs cash and space.",
      "buy the larger dairy order and watch sales.",
      "Buy the larger order",
      "Keep smaller orders"
    ],
    [
      "A snack supplier offer",
      "Solace shares a bulk snack offer with Stocky and Penny. The discount is certain; demand for the new flavor is not.",
      "buy the batch at the lower price.",
      "Buy the batch",
      "Keep regular orders"
    ],
    [
      "Coffee prices rising",
      "Solace shares the new supplier price instantly. Buying coffee now saves money per pack, but locks up cash for weeks.",
      "buy more coffee before the supplier increase.",
      "Buy at today’s price",
      "Keep smaller orders"
    ],
    [
      "More local produce",
      "Solace connects the farm offer to live store demand. Local produce is popular, but the farm requires a larger order.",
      "accept the larger farm order.",
      "Buy the farm order",
      "Keep smaller orders"
    ],
    [
      "Warehouse discount",
      "Solace matches discounted warehouse stock to our sales. Some products sell slowly, and their future demand is unclear.",
      "buy the discounted stock with a plan to sell it.",
      "Buy the stock",
      "Keep cash available"
    ],
    [
      "A supplier needs a promise",
      "Solace shares next month’s supplier offer with the buying bots. A larger order secures stock, but the holiday forecast is uncertain.",
      "commit to a larger order to secure supply.",
      "Reserve the stock",
      "Buy week by week"
    ]
  ],
  "fraud": [
    [
      "A return worth checking",
      "Solace links return records across service desks. One pattern looks unusual, but it could be an honest customer.",
      "ask staff to check the receipt before refunding.",
      "Check the receipt",
      "Refund without review"
    ],
    [
      "An uncertain scan",
      "Solace routes a checkout alert to Shield. The scan looks unusual, but a staff check will slow a busy lane.",
      "add a polite staff check at checkout.",
      "Check the basket",
      "Keep the lane moving"
    ],
    [
      "Coupon exception",
      "Solace blocks reused coupon codes across all channels. A shopper asks for a goodwill credit, but has no proof of the original purchase.",
      "verify the purchase before granting a credit.",
      "Ask for purchase proof",
      "Grant a small credit"
    ],
    [
      "Large gift card refund",
      "Solace joins purchase and refund events for Shield. The request looks unusual, but the customer’s explanation could be true.",
      "review the refund with a manager.",
      "Review the refund",
      "Refund without review"
    ],
    [
      "Protect the display",
      "Solace shares live stock and security signals with Shield. A guarded electronics display reduces risk, but makes browsing slower.",
      "add staff checks around the electronics display.",
      "Add display checks",
      "Keep easy browsing"
    ],
    [
      "A courier handoff",
      "Solace gives the courier and store bots the same order status. A name differs on the pickup ID, and the queue is growing.",
      "verify the courier’s authority before handing over the order.",
      "Verify the pickup ID",
      "Allow the handoff"
    ]
  ],
  "review": [
    [
      "A missing item claim",
      "Solace confirms the order and handoff records. A customer reports a missing item; what happened after delivery is unclear.",
      "refund the disputed item as a goodwill gesture.",
      "Refund the item",
      "Explain our policy"
    ],
    [
      "A warm delivery claim",
      "Solace shares the cold-chain readings and delivery time. A customer says food arrived warm, but the final doorstep reading is unknown.",
      "replace the disputed order as a goodwill gesture.",
      "Replace the order",
      "Explain the readings"
    ],
    [
      "Yesterday’s price",
      "Solace updates shelf, checkout, and online prices together. Yesterday’s buyers now want the same discount; honoring it will cost money.",
      "offer yesterday’s buyers a goodwill refund.",
      "Refund the difference",
      "Keep the sale policy"
    ],
    [
      "Pickup went to plan",
      "Solace coordinates the pickup bots and confirms a complete handoff. A customer later reports a missing bag; proof is incomplete.",
      "replace the disputed items to protect customer trust.",
      "Replace the items",
      "Explain our policy"
    ],
    [
      "Customers want faster help",
      "Solace routes customer questions to the right bots immediately. Human review takes time, and extra staff would cut the wait.",
      "fund extra support for cases that need a person.",
      "Add human support",
      "Keep current staffing"
    ],
    [
      "A substitute disappoints",
      "Solace tells the picker and customer bots about a stock change. A shopper accepted a substitute but now wants a refund.",
      "refund the substitute as a goodwill gesture.",
      "Refund the substitute",
      "Keep the agreed sale"
    ]
  ],
  "promotion": [
    [
      "A quiet afternoon",
      "Solace shares live sales and spare stock with Spark. A quick offer could bring shoppers in, but lowers the margin per item.",
      "run an afternoon offer across store and online channels.",
      "Start the offer",
      "Keep normal prices"
    ],
    [
      "An evening meal deal",
      "Solace coordinates bundle prices across every channel. A meal deal may sell more stock, but demand could stay quiet.",
      "launch the meal bundle across the food departments.",
      "Launch the meal deal",
      "Keep normal prices"
    ],
    [
      "Office lunch orders",
      "Solace connects office enquiries to stock and kitchen bots. A lunch offer could win business, but strains the same stock shoppers need.",
      "launch the lunch deal with stock reserved for office orders.",
      "Launch the lunch deal",
      "Keep normal sales"
    ],
    [
      "A regional campaign",
      "Solace gives marketing and stock bots the same live plan. A campaign could grow sales, but how many shoppers will come is unclear.",
      "launch the campaign and prepare the teams.",
      "Launch the campaign",
      "Skip the campaign"
    ],
    [
      "A busy event weekend",
      "Solace shares event forecasts with pricing and stock bots. A snack offer could raise sales, but the crowd size is uncertain.",
      "run a snack and drink offer for the event.",
      "Start the event offer",
      "Keep normal prices"
    ],
    [
      "Match a rival’s offer",
      "Solace can update every price and order channel together. A rival cuts prices; matching them protects sales but reduces margin.",
      "match the rival’s offer across all channels.",
      "Match the offer",
      "Protect our margin"
    ]
  ],
  "staff": [
    [
      "A queue needs people",
      "Solace sends live queue counts to Sam and Penny. More checkout staff cut waiting, but use cash set aside for stock.",
      "add staff to open more checkout lanes.",
      "Add checkout staff",
      "Use the current team"
    ],
    [
      "Cover the busy shift",
      "Solace coordinates checkout and pickup tasks in real time. Extra cover eases the workload, but the rush may end soon.",
      "pay for extra shift cover during the busy period.",
      "Add shift cover",
      "Use the current team"
    ],
    [
      "Time for training",
      "Solace routes tasks to the right bots and staff. New staff still need human coaching, which costs another paid shift.",
      "fund a training shift for the new team.",
      "Add a training shift",
      "Coach during the shift"
    ],
    [
      "Weekend staffing choice",
      "Solace shares a live weekend forecast with staffing bots. It looks busy, but the estimate may change after the weather report.",
      "book extra shifts before the weekend.",
      "Book extra shifts",
      "Use the current team"
    ],
    [
      "Pickup or checkout",
      "Solace directs pickup bots to ready orders. Human handoffs are busy; borrowing checkout staff would lengthen those queues.",
      "add paid cover at the pickup area.",
      "Add pickup staff",
      "Share checkout staff"
    ],
    [
      "Late orders, tired staff",
      "Solace coordinates the last picking jobs across the bots. Paid overtime protects pickup times, but increases costs and staff fatigue.",
      "offer a paid extra shift for the late orders.",
      "Pay for extra cover",
      "Finish with this team"
    ]
  ],
  "waste": [
    [
      "Ripe fruit decision",
      "Solace shares live freshness readings with pricing bots. A markdown sells fruit sooner; keeping the price may earn more or leave waste.",
      "discount ripe fruit while it is fresh.",
      "Discount the fruit",
      "Keep full prices"
    ],
    [
      "Bread before closing",
      "Solace can update bread prices in every channel together. A markdown clears surplus, but some full-price shoppers may buy less tomorrow.",
      "offer discounted bread bundles before closing.",
      "Discount the bread",
      "Keep full prices"
    ],
    [
      "Dairy nearing its date",
      "Solace links use-by dates to live sales. Discounting dairy reduces waste, but regular shoppers may wait for cheaper stock next time.",
      "discount dairy while it is safe to sell.",
      "Discount the dairy",
      "Keep full prices"
    ],
    [
      "Too much fresh stock",
      "Solace shares the same freshness and stock view with all bots. A markdown frees space, but demand might rise later today.",
      "discount the extra fresh stock now.",
      "Discount extra stock",
      "Wait for more sales"
    ],
    [
      "Food rescue boxes",
      "Solace coordinates fresh stock, pricing, and pickup bots. Cheap rescue boxes cut waste, but may replace full-price orders.",
      "sell discounted boxes of safe fresh food.",
      "Sell food boxes",
      "Keep normal sales"
    ],
    [
      "One price for ripe stock",
      "Solace can publish a ripe-stock markdown to labels, tills, and online orders together. It saves food but reduces today’s margin.",
      "apply the markdown across all channels.",
      "Publish the markdown",
      "Keep full prices"
    ]
  ],
  "equipment": [
    [
      "A freezer needs service",
      "Solace routes rising freezer readings to the stock and maintenance bots. Early repairs protect stock, but an urgent visit costs more.",
      "book urgent freezer maintenance.",
      "Service the freezer",
      "Monitor until service"
    ],
    [
      "A robot needs a battery",
      "Solace reroutes picking jobs around a robot with a worn battery. Replacing it restores capacity; the other bots can cover at a slower pace.",
      "replace the robot battery now.",
      "Replace the battery",
      "Use fewer robots"
    ],
    [
      "An older camera",
      "Solace delivers the camera’s health alert to Shield. A new camera improves coverage, but staff patrols could cover the area for now.",
      "replace the aging camera.",
      "Replace the camera",
      "Use staff patrols"
    ],
    [
      "Service the loading door",
      "Solace coordinates safe loading slots around a worn door motor. Repairing it now takes money and closes one bay for an hour.",
      "repair the loading door during a planned slot.",
      "Repair the door",
      "Use the other bay"
    ],
    [
      "Cooling maintenance",
      "Solace shares cooling readings with maintenance and stock bots. An early service visit reduces risk, but the normal visit is tomorrow.",
      "bring the cooling service forward.",
      "Service cooling now",
      "Monitor until tomorrow"
    ],
    [
      "More charging space",
      "Solace coordinates robot charging so picking continues. More charging bays improve capacity, but take space and cash from stock storage.",
      "add charging bays for the picking robots.",
      "Add charging bays",
      "Keep staggered charging"
    ]
  ],
  "delivery": [
    [
      "A late warehouse truck",
      "Solace shares the truck’s new arrival time with shelf and pickup bots. Backup supply is quicker, but costs more than waiting.",
      "use backup supply before the rush.",
      "Use backup supply",
      "Wait for the truck"
    ],
    [
      "Storm on the route",
      "Solace reroutes delivery updates to every store bot. A backup truck avoids the storm, but its fee is high and demand is uncertain.",
      "book a backup delivery on the safer route.",
      "Book the backup truck",
      "Wait for the shipment"
    ],
    [
      "Borrow another store’s stock",
      "Solace matches our low stock to a nearby store’s surplus. A transfer helps today, but costs money and leaves that store less cover.",
      "arrange the nearby stock transfer.",
      "Transfer the stock",
      "Wait for normal supply"
    ],
    [
      "A short supplier shipment",
      "Solace shares the supplier’s confirmed short shipment before arrival. Backup stock costs more; selling substitutes protects cash.",
      "buy replacement stock from a backup supplier.",
      "Buy replacement stock",
      "Offer substitutes"
    ],
    [
      "Two trucks running late",
      "Solace keeps all bots updated on two delayed trucks. Backup supply protects availability, but there is only enough cash for a small order.",
      "order backup stock for the busiest departments.",
      "Use backup supply",
      "Wait and save cash"
    ],
    [
      "Last urgent delivery slot",
      "Solace finds one urgent delivery slot and shares it with both buying bots. Taking it protects our stock, but costs more than tomorrow’s route.",
      "reserve the urgent delivery slot.",
      "Book the urgent slot",
      "Wait until tomorrow"
    ]
  ],
  "cash": [
    [
      "Large bills due",
      "Solace shares current cash and stock with Penny and Stocky. Clearing slow products pays bills, but leaves less choice for shoppers.",
      "discount slow stock to free cash for bills.",
      "Clear slow stock",
      "Keep the full range"
    ],
    [
      "Costs rising",
      "Solace brings supplier costs and sales into one live view. Clearing slow items frees cash, but may disappoint their loyal buyers.",
      "clear slow products to protect available cash.",
      "Clear slow products",
      "Keep the full range"
    ],
    [
      "Supplier invoices due",
      "Solace shares the invoice schedule with both buying bots. A stock clearance frees cash, but sacrifices some future full-price sales.",
      "sell slow stock to pay the invoices.",
      "Free cash from stock",
      "Keep the stock"
    ],
    [
      "Cash tied up in stock",
      "Solace shows which stock sells slowly across all channels. A clearance makes room for new orders, but reduces the available range.",
      "run a clearance on slow-selling products.",
      "Clear slow stock",
      "Wait for normal sales"
    ],
    [
      "Payroll approaching",
      "Solace updates the cash forecast as orders arrive. Clearing stock protects payroll cash, but demand for those products could rebound.",
      "sell slow stock before payroll.",
      "Clear slow stock",
      "Wait for full-price sales"
    ],
    [
      "A new range or more cash",
      "Solace shares live sales for a trial range with Penny and Stocky. Clearing it funds essentials, but the trial may need more time.",
      "clear the trial range to fund essentials.",
      "Clear the trial range",
      "Give the range time"
    ]
  ],
  "loyalty": [
    [
      "Reward repeat shoppers",
      "Solace links repeat visits across store and online orders. A reward may bring people back, but its future value is uncertain.",
      "offer an affordable reward for repeat shoppers.",
      "Offer customer rewards",
      "Keep the cash"
    ],
    [
      "Member birthday offers",
      "Solace coordinates birthday offers and redemptions across all channels. More rewards build trust, but add cost without guaranteed visits.",
      "offer a small birthday reward to members.",
      "Offer birthday rewards",
      "Skip the reward cost"
    ],
    [
      "Reusable bag rewards",
      "Solace shares bag choices with checkout and pickup bots. Rewards encourage reuse, but cost money on orders we might have won anyway.",
      "reward customers who use reusable bags.",
      "Reward reusable bags",
      "Keep current pricing"
    ],
    [
      "A customer tasting day",
      "Solace coordinates tasting stock and event bookings. A tasting day may bring shoppers back, but needs stock and paid staff.",
      "host a tasting day across food departments.",
      "Host the tasting day",
      "Skip the event cost"
    ],
    [
      "More local products",
      "Solace shares customer requests with buying bots. A local range could build loyalty, but needs spending before demand is proven.",
      "fund a small local-products area.",
      "Fund the local range",
      "Keep the current range"
    ],
    [
      "A delivery fee reward",
      "Solace coordinates loyalty benefits with delivery bots. Free delivery for regular shoppers may keep them loyal, but every trip still costs us.",
      "fund a delivery reward for regular shoppers.",
      "Offer free delivery",
      "Keep delivery fees"
    ]
  ],
  "resilience": [
    [
      "A busy day needs cover",
      "Solace routes live queue and stock alerts to the right bots. Extra human cover helps them act, but reduces cash for tomorrow.",
      "fund backup support for the busy teams.",
      "Add backup support",
      "Use the current team"
    ],
    [
      "A forecast with gaps",
      "Solace joins sales, queue, and security events for the bots. Tomorrow’s demand is still uncertain; backup cover could go unused.",
      "fund backup support before the rush.",
      "Add backup support",
      "Keep cash available"
    ],
    [
      "A robot traffic plan",
      "Solace coordinates picking robots around a crowded aisle. Extra floor support keeps paths clear, but takes money from other departments.",
      "add floor support for the coordinated robot routes.",
      "Add floor support",
      "Use current cover"
    ],
    [
      "Returns during a rush",
      "Solace links unusual returns with growing queues and alerts both bots. Extra support reduces risk, but adds cost before anything is proven.",
      "add a shared support team for returns and checkout.",
      "Add shared support",
      "Use current cover"
    ],
    [
      "Several priorities at once",
      "Solace coordinates stock, pickup, and security bots from one live view. Extra support helps all three, but the budget is tight.",
      "fund a shared support shift for the busiest teams.",
      "Fund shared support",
      "Keep cash available"
    ],
    [
      "Crowds or a quiet day",
      "Solace shares weather, sales, and queue updates with every bot. Two forecasts disagree; backup support buys cover that may not be needed.",
      "book backup cover while availability is certain.",
      "Book backup cover",
      "Wait for a clearer forecast"
    ]
  ]
};

const fx = (
  delta: [number, number, number, number],
  outcome: string,
  extra: Partial<Effect> = {},
): Effect => ({
  delta: {
    inventory: delta[0],
    security: delta[1],
    reputation: delta[2],
    cash: delta[3],
  },
  outcome,
  ...extra,
});
const PROFILES: Record<
  Family,
  {
    agent: AgentId;
    peer: AgentId;
    approve: Effect;
    reject: Effect;
    opinion: string;
    peerOpinion: string;
  }
> = {
  stock: {
    agent: "STOCKY",
    peer: "PENNY",
    approve: fx(
      [16, 0, 3, -9],
      "The extra order is confirmed. More stock will arrive soon.",
      { delivery: 9 },
    ),
    reject: fx(
      [-8, 0, -3, 4],
      "We save cash, but more products may sell out.",
      { demand: -0.1 },
    ),
    opinion: "Customers need products on the shelves. We should order more.",
    peerOpinion:
      "Rush deliveries cost more. We need enough cash for other bills.",
  },
  supplier: {
    agent: "STOCKY",
    peer: "PENNY",
    approve: fx(
      [13, 0, 2, -7],
      "The larger order is confirmed. Stock rises, but cash falls.",
      { waste: 5, delivery: 5 },
    ),
    reject: fx(
      [-3, 1, 0, 5],
      "We keep cash available, but pay more per product.",
      {
        margin: -0.02,
      },
    ),
    opinion: "A larger order gives us more stock at a lower price.",
    peerOpinion:
      "It uses cash and storage space. Some products may go to waste.",
  },
  fraud: {
    agent: "SHIELD",
    peer: "SPARK",
    approve: fx(
      [1, 15, -2, -7],
      "The checks reduce losses, but customers may wait longer.",
      { fraud: -1 },
    ),
    reject: fx(
      [-3, -9, 4, 4],
      "Service stays quick, but unchecked transactions may cause losses.",
      { fraud: 1 },
    ),
    opinion: "Repeated unusual transactions need to be checked.",
    peerOpinion: "Keep checks polite so honest customers still feel welcome.",
  },
  review: {
    agent: "SPARK",
    peer: "PENNY",
    approve: fx(
      [0, 0, 15, -7],
      "Customers get help. Reviews and trust improve.",
      { loyalty: 0.12 },
    ),
    reject: fx(
      [0, 1, -7, 4],
      "We save money, but complaints may put more customers off.",
      { loyalty: -0.12 },
    ),
    opinion: "Poor service can lead to more negative reviews.",
    peerOpinion: "Refunds cost money. We should also fix the cause.",
  },
  promotion: {
    agent: "SPARK",
    peer: "STOCKY",
    approve: fx(
      [-6, -2, 9, 10],
      "The offer brings more sales and puts more pressure on stock.",
      { promotion: 3, demand: 0.4 },
    ),
    reject: fx([3, 2, -4, -2], "We keep more stock, but miss some sales.", {
      demand: -0.12,
    }),
    opinion: "An offer can bring more customers and increase sales.",
    peerOpinion: "We need enough stock to handle the extra demand.",
  },
  staff: {
    agent: "SAM",
    peer: "PENNY",
    approve: fx(
      [1, 3, 10, -8],
      "Extra staff reduce waiting and help customers.",
      { staff: 1 },
    ),
    reject: fx(
      [0, -4, -7, 5],
      "We save on wages, but queues and staff pressure rise.",
      { staff: -0.3 },
    ),
    opinion: "A shorter queue is good for customers and the team.",
    peerOpinion: "Extra shifts cost money. Will demand stay high?",
  },
  waste: {
    agent: "STOCKY",
    peer: "PENNY",
    approve: fx(
      [-6, 0, 5, 9],
      "Discounted stock sells. Waste falls and cash improves.",
      { waste: -8 },
    ),
    reject: fx(
      [2, 0, -3, 2],
      "Prices stay the same, but more fresh food may go to waste.",
      { waste: 7 },
    ),
    opinion: "Sell fresh food now before we have to throw it away.",
    peerOpinion: "A discount earns less per product, but waste earns nothing.",
  },
  equipment: {
    agent: "SHIELD",
    peer: "PENNY",
    approve: fx([5, 6, 3, -9], "Repairs improve equipment and protect stock.", {
      equipment: 28,
    }),
    reject: fx(
      [-3, -4, -2, 5],
      "We save cash now, but equipment failures and waste become more likely.",
      { equipment: -12, waste: 4 },
    ),
    opinion: "Broken equipment can cause stock losses and poor service.",
    peerOpinion: "Can we manage today before paying for repairs?",
  },
  delivery: {
    agent: "STOCKY",
    peer: "PENNY",
    approve: fx(
      [14, 0, 4, -8],
      "Backup supply is confirmed. Stock will arrive sooner.",
      { delivery: 10, delay: -35 },
    ),
    reject: fx(
      [-7, 0, -3, 5],
      "We save cash, but the delay may leave more shelves empty.",
      { delay: 15 },
    ),
    opinion: "Customers need products before the delayed truck arrives.",
    peerOpinion: "Backup deliveries cost extra. We need to watch spending.",
  },
  cash: {
    agent: "PENNY",
    peer: "STOCKY",
    approve: fx(
      [-8, 1, -3, 18],
      "Slow stock is sold. More cash is available for bills.",
      { margin: 0.025 },
    ),
    reject: fx(
      [4, 0, 2, -7],
      "We keep the product range, but have less cash available.",
      { margin: -0.02 },
    ),
    opinion: "We need cash to pay bills. Unsold products cannot pay them.",
    peerOpinion: "Selling too much stock may cause shortages later.",
  },
  loyalty: {
    agent: "SPARK",
    peer: "PENNY",
    approve: fx(
      [0, 1, 12, -6],
      "Rewards give customers a reason to come back.",
      { loyalty: 0.18 },
    ),
    reject: fx(
      [1, 1, -3, 4],
      "We save money, but fewer customers may return.",
      { loyalty: -0.05 },
    ),
    opinion: "Happy returning customers bring more future sales.",
    peerOpinion: "Rewards cost money. Keep them affordable.",
  },
  resilience: {
    agent: "SHIELD",
    peer: "PENNY",
    approve: fx(
      [0, 12, 3, -9],
      "Solace coordinates the response. Extra support reduces risk, but uses cash.",
      {
        fraud: -0.5,
        equipment: 8,
      },
    ),
    reject: fx(
      [0, -7, 1, 5],
      "Solace keeps routing live updates. Current teams carry more risk while cash is preserved.",
      { fraud: 0.6 },
    ),
    opinion: "Solace has joined the live signals. Extra support helps the teams act on them.",
    peerOpinion: "Backup support costs money. Spend only what we need.",
  },
};
export const SITUATIONS: SituationTemplate[] = Object.entries(COPY).flatMap(
  ([key, rows]) => {
    const family = key as Family,
      profile = PROFILES[family];
    return rows.map(
      ([title, situation, recommendation, approveLabel, rejectLabel], i) => ({
        id: `${family}-${i}`,
        family,
        title,
        situation,
        recommendation,
        approveLabel,
        rejectLabel,
        ...profile,
        approve: { ...profile.approve, delta: { ...profile.approve.delta } },
        reject: { ...profile.reject, delta: { ...profile.reject.delta } },
        minDay: i < 3 || i === 5 ? 1 : i - 1,
        threshold: (i === 5 ? 2 : i) * 0.12,
      }),
    );
  },
);
