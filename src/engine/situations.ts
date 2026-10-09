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
      "Milk running low",
      "Solace flags low milk stock. Buying more costs extra, but waiting may leave empty shelves.",
      "order extra milk.",
      "Order more milk",
      "Wait for the truck"
    ],
    [
      "More pasta orders",
      "Solace updates shop and online stock together. Pasta is selling fast, but the rush may end soon.",
      "order more pasta.",
      "Order more pasta",
      "Use current stock"
    ],
    [
      "More fruit tonight?",
      "Solace spots rising fruit sales. More fruit helps today, but any leftovers could spoil tomorrow.",
      "order more fruit.",
      "Buy more fruit",
      "Keep the usual order"
    ],
    [
      "Breakfast stock low",
      "Solace warns before breakfast products run out. A fast delivery costs more; other brands are already on the shelves.",
      "order the missing breakfast products.",
      "Order the products",
      "Offer other brands"
    ],
    [
      "Basics selling fast",
      "Solace alerts both agents about low stock. Buying more basics fills shelves, but leaves less money for bills.",
      "order more basics.",
      "Buy more basics",
      "Save the money"
    ],
    [
      "Save stock for pickup?",
      "Solace keeps pickup and shelf stock updated. More pickup orders may arrive, but buying extra stock costs money.",
      "buy extra stock for pickup orders.",
      "Buy extra stock",
      "Use current stock"
    ]
  ],
  "supplier": [
    [
      "A big dairy order",
      "Solace shares a supplier discount. A bigger dairy order costs less per item, but uses more money and fridge space.",
      "buy the bigger dairy order.",
      "Buy the big order",
      "Buy smaller orders"
    ],
    [
      "Cheap new snacks",
      "Solace shares a snack discount. A big order is cheap, but we do not know if shoppers will like the new flavor.",
      "buy the discounted snacks.",
      "Buy the snacks",
      "Keep usual orders"
    ],
    [
      "Coffee costs more",
      "Solace shares the supplier’s new prices. Buying coffee now avoids the price rise, but uses money needed for other orders.",
      "buy coffee before the price rise.",
      "Buy coffee now",
      "Buy smaller orders"
    ],
    [
      "Local fruit offer",
      "Solace shares a local farm’s offer. The fruit is popular, but we must buy a larger order to get the discount.",
      "buy the larger farm order.",
      "Buy the big order",
      "Buy smaller orders"
    ],
    [
      "Cheap warehouse stock",
      "Solace checks sales before sharing a stock discount. The price is low, but some products may take weeks to sell.",
      "buy the discounted stock.",
      "Buy the cheap stock",
      "Save the money"
    ],
    [
      "Order for the holidays?",
      "Solace shares the holiday supply offer. A big order secures stock, but we do not yet know how much shoppers will buy.",
      "reserve the holiday stock.",
      "Reserve the stock",
      "Buy week by week"
    ]
  ],
  "fraud": [
    [
      "Check this return?",
      "Solace spots an unusual return. Checking the receipt may prevent a loss, but keeps an honest customer waiting.",
      "check the receipt before refunding.",
      "Check the receipt",
      "Give a quick refund"
    ],
    [
      "Check this basket?",
      "Solace flags an unusual checkout scan. A basket check may prevent a loss, but slows the queue.",
      "ask staff to check the basket.",
      "Check the basket",
      "Keep the queue moving"
    ],
    [
      "A coupon complaint",
      "Solace blocks a used coupon. The shopper asks for a small credit, but has no receipt to support the request.",
      "ask for the receipt first.",
      "Ask for the receipt",
      "Give a small credit"
    ],
    [
      "A large refund",
      "Solace links the purchase and refund. The request looks unusual, but the customer may have a good reason.",
      "ask a manager to review the refund.",
      "Review the refund",
      "Give a quick refund"
    ],
    [
      "Protect the electronics",
      "Solace shares live stock and risk alerts. Extra checks may reduce theft, but make shopping slower.",
      "add staff checks at the display.",
      "Add staff checks",
      "Keep easy browsing"
    ],
    [
      "Check the courier?",
      "Solace shares the order status with both teams. The courier’s ID has a different name, and customers are waiting.",
      "check the courier’s ID.",
      "Check the ID",
      "Allow the pickup"
    ]
  ],
  "review": [
    [
      "An item is missing?",
      "Solace confirms a complete delivery handoff. A customer says an item is missing, but we cannot confirm what happened next.",
      "refund the disputed item.",
      "Refund the item",
      "Ask for proof"
    ],
    [
      "Food arrived warm?",
      "Solace shares the delivery’s temperature checks. A customer says the food arrived warm, but the final temperature is unknown.",
      "replace the customer’s order.",
      "Replace the order",
      "Ask for proof"
    ],
    [
      "Yesterday’s shoppers",
      "Solace keeps shop and online prices the same. Yesterday’s shoppers want today’s discount too, but refunds cost money.",
      "refund yesterday’s price difference.",
      "Refund the difference",
      "Keep the sale policy"
    ],
    [
      "A missing pickup bag?",
      "Solace confirms all bags were handed over. A customer later reports one missing, but has no proof.",
      "replace the missing items.",
      "Replace the items",
      "Ask for proof"
    ],
    [
      "Faster customer help",
      "Solace sends questions to the right agents. Some still need a person, and hiring more staff costs money.",
      "add staff to help customers.",
      "Add support staff",
      "Use current staff"
    ],
    [
      "A different brand",
      "Solace updates the order with an agreed replacement. The shopper now dislikes it and wants their money back.",
      "refund the replacement item.",
      "Refund the item",
      "Keep the agreed sale"
    ]
  ],
  "promotion": [
    [
      "A quiet afternoon",
      "Solace shows slow sales and spare stock. A discount may bring more shoppers, but we earn less on each item.",
      "start an afternoon discount.",
      "Start the discount",
      "Keep normal prices"
    ],
    [
      "A meal deal",
      "Solace keeps meal-deal prices updated everywhere. A deal may sell more food, but we earn less per item.",
      "start the meal deal.",
      "Start the meal deal",
      "Keep normal prices"
    ],
    [
      "Office lunch orders",
      "Solace connects lunch orders to stock. A deal could win office customers, but leaves less food for other shoppers.",
      "start a lunch deal for offices.",
      "Start the lunch deal",
      "Keep normal sales"
    ],
    [
      "Advertise the shop?",
      "Solace shares the sales plan with all agents. Advertising may bring shoppers, but we do not know how many.",
      "start the advertising campaign.",
      "Run the adverts",
      "Skip the adverts"
    ],
    [
      "A busy weekend?",
      "Solace shares the local event forecast. A snack offer could sell well, but the number of visitors is uncertain.",
      "start a weekend snack offer.",
      "Start the snack offer",
      "Keep normal prices"
    ],
    [
      "A rival cuts prices",
      "Solace can change all our prices together. Matching a rival may keep shoppers, but we earn less per sale.",
      "match the rival’s prices.",
      "Match their prices",
      "Keep our prices"
    ]
  ],
  "staff": [
    [
      "Long checkout queues",
      "Solace tells the team where queues are growing. More staff reduce waiting, but leave less money for stock.",
      "add checkout staff.",
      "Add checkout staff",
      "Use current staff"
    ],
    [
      "A busy shift",
      "Solace coordinates checkout and pickup work. Extra staff ease the pressure, but the rush may end soon.",
      "pay for extra staff.",
      "Add more staff",
      "Use current staff"
    ],
    [
      "Train the new team",
      "Solace assigns jobs to the team. New staff need training, but a separate training shift costs money.",
      "pay for a training shift.",
      "Pay for training",
      "Train while working"
    ],
    [
      "More weekend staff?",
      "Solace shares the latest sales forecast. The weekend looks busy, but bad weather could keep shoppers away.",
      "book extra weekend staff.",
      "Book extra staff",
      "Use current staff"
    ],
    [
      "Pickup or checkout?",
      "Solace tells the team which orders are ready. Pickup needs help, but moving checkout staff will make those queues longer.",
      "hire extra pickup staff.",
      "Add pickup staff",
      "Move checkout staff"
    ],
    [
      "Late orders to finish",
      "Solace coordinates the final picking jobs. Extra paid staff can finish sooner, but the budget is tight.",
      "pay for extra help.",
      "Pay for extra staff",
      "Use current staff"
    ]
  ],
  "waste": [
    [
      "Ripe fruit",
      "Solace flags fruit nearing its last selling day. A discount reduces waste, but we earn less per item.",
      "discount the ripe fruit.",
      "Discount the fruit",
      "Keep full prices"
    ],
    [
      "Bread left over",
      "Solace can update bread prices everywhere. A discount sells today’s bread, but shoppers may expect cheap bread tomorrow too.",
      "discount the leftover bread.",
      "Discount the bread",
      "Keep full prices"
    ],
    [
      "Dairy dates are close",
      "Solace shares the dairy use-by dates. A discount cuts waste, but some shoppers may stop buying at full price.",
      "discount the dairy products.",
      "Discount the dairy",
      "Keep full prices"
    ],
    [
      "Too much fresh food",
      "Solace flags extra fresh stock. A discount sells it sooner, but more full-price shoppers may arrive later.",
      "discount the extra fresh food.",
      "Discount it now",
      "Wait for more sales"
    ],
    [
      "Cheap food boxes",
      "Solace coordinates spare food and pickup orders. Cheap boxes cut waste, but may replace full-price sales.",
      "sell discounted food boxes.",
      "Sell cheap food boxes",
      "Keep normal sales"
    ],
    [
      "Discount ripe stock?",
      "Solace updates shelf, checkout, and online prices together. Discounting ripe food saves waste, but lowers profit per item.",
      "discount the ripe stock everywhere.",
      "Discount the stock",
      "Keep full prices"
    ]
  ],
  "equipment": [
    [
      "Service the freezer?",
      "Solace alerts the team to warmer freezer readings. Urgent service protects food, but costs more than a planned visit.",
      "book urgent freezer service.",
      "Service it now",
      "Monitor and wait"
    ],
    [
      "A tired robot battery",
      "Solace moves jobs to other robots. A new battery restores speed, but using fewer robots saves money.",
      "replace the robot battery.",
      "Buy a new battery",
      "Use fewer robots"
    ],
    [
      "Replace the camera?",
      "Solace flags an aging camera. A new one improves security, but staff can check the area for now.",
      "replace the aging camera.",
      "Buy a new camera",
      "Use staff checks"
    ],
    [
      "Repair the loading door",
      "Solace routes deliveries to the other loading door. A repair costs money, but using one door slows unloading.",
      "repair the loading door.",
      "Repair the door",
      "Use the other door"
    ],
    [
      "Cooling needs service",
      "Solace shares warmer cooling readings. An early service visit reduces risk, but the usual visit is tomorrow.",
      "service the cooling system today.",
      "Service it today",
      "Monitor until tomorrow"
    ],
    [
      "More robot chargers?",
      "Solace schedules charging so robots keep working. Extra chargers speed things up, but cost money and storage space.",
      "buy more robot chargers.",
      "Buy more chargers",
      "Take turns charging"
    ]
  ],
  "delivery": [
    [
      "The truck is late",
      "Solace tells all agents when the truck will arrive. Another supplier is faster, but costs more.",
      "order from another supplier.",
      "Use another supplier",
      "Wait for the truck"
    ],
    [
      "A storm slows trucks",
      "Solace shares the latest delivery times. A backup truck can arrive sooner, but its delivery fee is high.",
      "book the backup truck.",
      "Book another truck",
      "Wait for the delivery"
    ],
    [
      "Borrow nearby stock?",
      "Solace finds spare stock at a nearby shop. Moving it helps us today, but costs money and leaves that shop less stock.",
      "transfer the nearby stock.",
      "Transfer the stock",
      "Wait for our delivery"
    ],
    [
      "The supplier sends less",
      "Solace warns us before the short delivery arrives. Replacement stock costs more, but shoppers may accept another brand.",
      "buy replacement stock.",
      "Buy replacement stock",
      "Offer other brands"
    ],
    [
      "Two late trucks",
      "Solace keeps every agent updated on the delays. Backup stock fills shelves sooner, but we can only afford a small order.",
      "buy a small backup order.",
      "Buy backup stock",
      "Wait and save money"
    ],
    [
      "One fast delivery left",
      "Solace finds one fast delivery slot. Taking it helps us today, but tomorrow’s delivery is cheaper.",
      "book the fast delivery.",
      "Book it today",
      "Wait until tomorrow"
    ]
  ],
  "cash": [
    [
      "Bills need paying",
      "Solace shares the latest money and stock totals. Discounting slow products pays the bills, but leaves shoppers less choice.",
      "discount slow-selling products.",
      "Sell slow stock cheaply",
      "Keep the full range"
    ],
    [
      "Costs are rising",
      "Solace shares new costs with both agents. Selling slow products cheaply frees money, but some regular shoppers want that range.",
      "discount slow-selling products.",
      "Discount slow stock",
      "Keep the full range"
    ],
    [
      "Supplier bills are due",
      "Solace shows when supplier bills must be paid. Selling stock cheaply frees money, but loses possible full-price sales.",
      "discount stock to pay the bills.",
      "Sell stock cheaply",
      "Keep the stock"
    ],
    [
      "Money stuck in stock",
      "Solace shows which products sell slowly. Discounts free money for new orders, but reduce our product range.",
      "discount slow-selling products.",
      "Discount slow stock",
      "Wait for normal sales"
    ],
    [
      "Payday is close",
      "Solace updates the money forecast. Cheap stock sales help pay wages, but demand for those products might rise later.",
      "sell slow stock before payday.",
      "Sell stock cheaply",
      "Wait for full-price sales"
    ],
    [
      "Keep the new products?",
      "Solace shares sales of our new products. Dropping them frees money for basics, but shoppers may need time to try them.",
      "discount the new products to free money.",
      "Sell them cheaply",
      "Give them more time"
    ]
  ],
  "loyalty": [
    [
      "Reward regular shoppers",
      "Solace spots regular shoppers across shop and online orders. Rewards may bring them back, but cost money today.",
      "offer regular shoppers a reward.",
      "Offer a reward",
      "Save the money"
    ],
    [
      "Birthday discounts",
      "Solace applies birthday offers across all channels. Discounts may bring members back, but another visit is not guaranteed.",
      "offer birthday discounts.",
      "Offer birthday discounts",
      "Skip the discount cost"
    ],
    [
      "Reward reusable bags",
      "Solace tracks bags at checkout and pickup. A reward encourages reuse, but pays shoppers who may already bring bags.",
      "reward reusable bags.",
      "Reward reusable bags",
      "Keep current prices"
    ],
    [
      "Try before buying",
      "Solace coordinates tasting stock and bookings. Free tastings may win customers, but need food and paid staff.",
      "host a food tasting.",
      "Host a tasting",
      "Skip the event cost"
    ],
    [
      "Sell more local food?",
      "Solace shares requests for local products. Adding them may keep shoppers happy, but sales are not yet proven.",
      "add a small local food range.",
      "Add local products",
      "Keep the current range"
    ],
    [
      "Free delivery reward",
      "Solace shares delivery rewards with the order agents. Free delivery may keep regular shoppers, but each trip still costs us money.",
      "offer free delivery to regular shoppers.",
      "Offer free delivery",
      "Keep delivery fees"
    ]
  ],
  "resilience": [
    [
      "Extra help today?",
      "Solace sends live alerts to the right agents. More staff help with the rush, but leave less money for tomorrow.",
      "pay for extra support staff.",
      "Add more staff",
      "Use current staff"
    ],
    [
      "How busy tomorrow?",
      "Solace shares the latest sales and queue data. Extra staff prepare us for a rush, but tomorrow may be quiet.",
      "book extra staff for tomorrow.",
      "Book extra staff",
      "Save the money"
    ],
    [
      "Robots in a busy aisle",
      "Solace guides robots around shoppers. Extra floor staff keep paths clear, but cost money needed elsewhere.",
      "add staff to help in the aisle.",
      "Add floor staff",
      "Use current staff"
    ],
    [
      "Returns in a rush",
      "Solace alerts both teams to unusual returns and long queues. Extra help reduces risk, but costs money before we know more.",
      "add staff for returns and checkout.",
      "Add more staff",
      "Use current staff"
    ],
    [
      "Three busy teams",
      "Solace coordinates stock, pickup, and security work. Extra staff help all three teams, but we have little money to spare.",
      "pay for extra support staff.",
      "Add shared staff",
      "Save the money"
    ],
    [
      "Will the crowd come?",
      "Solace shares the latest sales and weather data. Extra staff cover a possible rush, but the forecasts disagree.",
      "book extra staff while they are available.",
      "Book extra staff",
      "Wait for more information"
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
      "Solace keeps the teams updated. Extra help reduces risk, but costs money.",
      {
        fraud: -0.5,
        equipment: 8,
      },
    ),
    reject: fx(
      [0, -7, 1, 5],
      "Solace keeps the teams updated. We save money, but current staff face more pressure.",
      { fraud: 0.6 },
    ),
    opinion: "Solace shares the latest updates. Extra staff help the teams act on them.",
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
