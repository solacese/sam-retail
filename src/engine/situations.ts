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
  stock: [
    [
      "Milk running low",
      "Milk sales are rising across the store. The next warehouse delivery is late.",
      "Order extra milk now so the dairy aisles stay stocked.",
      "Order extra milk",
      "Wait for the delivery",
    ],
    [
      "Online orders jump",
      "Online orders for pasta have risen sharply. Picking teams are running out of stock.",
      "Order more pasta for both online orders and store shelves.",
      "Order more pasta",
      "Sell the stock we have",
    ],
    [
      "Fresh fruit shortage",
      "The produce department is selling fruit faster than the warehouse can replace it.",
      "Bring in an extra pallet of fruit before the evening rush.",
      "Order extra fruit",
      "Wait for normal supply",
    ],
    [
      "Empty breakfast aisles",
      "Several breakfast products are sold out. Customers are leaving without them.",
      "Order the missing products and refill the aisles.",
      "Refill the aisles",
      "Save the delivery cost",
    ],
    [
      "Essentials in demand",
      "Demand for everyday products is high. Several departments have low stock.",
      "Place a rush order for the products customers need most.",
      "Rush the essentials",
      "Keep the cash",
    ],
  ],
  supplier: [
    [
      "A larger dairy order",
      "The dairy supplier offers a lower price for a full truckload. Storage space is limited.",
      "Buy the larger order, but watch how quickly it sells.",
      "Buy the larger order",
      "Keep smaller orders",
    ],
    [
      "A snack supplier offer",
      "A supplier offers a large batch of snacks at a discount. Unsold packs could go to waste.",
      "Buy the batch and make space in the snack aisles.",
      "Buy the batch",
      "Keep regular orders",
    ],
    [
      "Coffee prices rising",
      "Coffee prices are going up. A large order would let us buy at today’s price.",
      "Buy more coffee now to avoid the higher price.",
      "Buy at today’s price",
      "Keep smaller orders",
    ],
    [
      "More local produce",
      "A regional farm offers fresh produce at a good price, with a larger minimum order.",
      "Accept the order and supply the produce department.",
      "Buy the farm order",
      "Keep our supplier",
    ],
    [
      "Warehouse discount",
      "Our supplier is clearing a warehouse. A large order is cheaper, but takes up cash and space.",
      "Buy the discounted stock and plan to sell it quickly.",
      "Buy the stock",
      "Keep the cash",
    ],
  ],
  fraud: [
    [
      "Repeated returns",
      "The same receipts are being used for appliance returns at several service desks.",
      "Check each receipt before paying another refund.",
      "Check the receipts",
      "Keep fast refunds",
    ],
    [
      "Wrong checkout scans",
      "Self-checkout reports show costly products being scanned as cheaper items.",
      "Add staff checks at the self-checkout lanes.",
      "Add checkout checks",
      "Keep queues moving",
    ],
    [
      "Coupons used twice",
      "Single-use coupons are being reused across checkout lanes and online orders.",
      "Check coupon codes before accepting them.",
      "Check coupon codes",
      "Accept the coupons",
    ],
    [
      "Unusual gift card refunds",
      "Large gift card purchases are followed by quick refunds. The pattern keeps repeating.",
      "Ask a manager to check unusual refunds.",
      "Review the refunds",
      "Pay refunds quickly",
    ],
    [
      "Missing electronics",
      "Electronics stock is falling faster than recorded sales. The open display is hard to watch.",
      "Secure the display and add checks for high-value products.",
      "Secure the display",
      "Keep the open display",
    ],
  ],
  review: [
    [
      "Missing grocery orders",
      "Several online customers report missing products. Poor reviews are spreading.",
      "Refund the missing products and improve order checks.",
      "Refund and fix orders",
      "Reply with our policy",
    ],
    [
      "Frozen food complaints",
      "Customers say frozen food arrived warm. The delivery service is getting poor reviews.",
      "Replace the affected orders and explain what went wrong.",
      "Replace the orders",
      "Reply without replacing",
    ],
    [
      "Prices do not match",
      "Shelf labels and checkout prices do not match in several aisles. Customers are complaining.",
      "Honor the shelf prices and fix the labels.",
      "Honor shelf prices",
      "Keep checkout prices",
    ],
    [
      "Pickup orders incomplete",
      "Pickup customers are finding missing bags. Many are asking the service team for help.",
      "Replace the missing items and improve pickup checks.",
      "Replace missing items",
      "Reply with our policy",
    ],
    [
      "Service complaints rise",
      "Long waits and unanswered messages are bringing more negative reviews.",
      "Spend more on customer support and follow up on complaints.",
      "Improve support",
      "Reply without spending",
    ],
  ],
  promotion: [
    [
      "A quiet afternoon",
      "Sales are slow across the store. A short offer could bring more customers in.",
      "Run a store-wide offer and prepare for more orders.",
      "Start the offer",
      "Keep normal prices",
    ],
    [
      "An evening meal deal",
      "Many evening shoppers buy just one item. A meal bundle could increase sales.",
      "Offer a meal bundle across the food departments.",
      "Launch the meal deal",
      "Keep normal prices",
    ],
    [
      "Office lunch orders",
      "Nearby offices want large lunch orders. A lunch offer could win their business.",
      "Launch a lunch deal for office and online orders.",
      "Launch the lunch deal",
      "Keep current sales",
    ],
    [
      "A regional campaign",
      "A local campaign could reach more shoppers. It will bring extra demand to the store.",
      "Launch the campaign and prepare for a busy day.",
      "Launch the campaign",
      "Skip the campaign",
    ],
    [
      "A busy event weekend",
      "A large event nearby will bring more visitors. A snack offer could increase sales.",
      "Run a weekend offer for snacks and drinks.",
      "Start the event offer",
      "Keep normal prices",
    ],
  ],
  staff: [
    [
      "Long checkout queues",
      "Queues are growing across the checkout area. Customers are waiting too long.",
      "Add extra staff to open more checkout lanes.",
      "Add checkout staff",
      "Use the current team",
    ],
    [
      "Breaks need cover",
      "Checkout and pickup teams are short of staff. Planned breaks are being delayed.",
      "Pay for extra shift cover so staff can take their breaks.",
      "Add shift cover",
      "Use the current team",
    ],
    [
      "Training during a rush",
      "New checkout staff need help. Experienced staff are already serving long queues.",
      "Add a training shift to support the new team.",
      "Add a training shift",
      "Use the current team",
    ],
    [
      "Weekend staffing gap",
      "The weekend forecast is busy, but several checkout shifts are not covered.",
      "Book extra staff before the busy period starts.",
      "Book extra shifts",
      "Use the current team",
    ],
    [
      "Pickup orders waiting",
      "Online orders are ready, but the pickup team cannot hand them out fast enough.",
      "Add staff to the pickup area to reduce waiting.",
      "Add pickup staff",
      "Share checkout staff",
    ],
  ],
  waste: [
    [
      "Too much fresh fruit",
      "Large batches of ripe fruit may go to waste before they sell.",
      "Lower the price today to sell the fruit while it is fresh.",
      "Discount the fruit",
      "Keep full prices",
    ],
    [
      "Bakery surplus",
      "The bakery has made more bread than customers are buying. Closing time is near.",
      "Offer discounted bread bundles before closing.",
      "Discount the bread",
      "Keep full prices",
    ],
    [
      "Dairy nearing its date",
      "Several pallets of dairy products are close to their use-by dates.",
      "Discount the products while they are still safe to sell.",
      "Discount the dairy",
      "Keep full prices",
    ],
    [
      "Fresh stock building up",
      "A large produce order has left too much fresh stock in storage.",
      "Discount the extra stock before it goes to waste.",
      "Discount extra stock",
      "Wait for more sales",
    ],
    [
      "Food rescue boxes",
      "Fresh food is not selling quickly enough. Some of it may be wasted today.",
      "Sell discounted food boxes while the products are fresh.",
      "Sell food boxes",
      "Keep normal sales",
    ],
  ],
  equipment: [
    [
      "Freezers getting warm",
      "Freezer sensors show rising temperatures. A large amount of frozen stock is at risk.",
      "Book urgent repairs to protect the frozen products.",
      "Repair the freezers",
      "Delay the repairs",
    ],
    [
      "Checkout systems failing",
      "Payment terminals keep stopping across several checkout lanes.",
      "Replace the failing terminals to keep payments working.",
      "Replace the terminals",
      "Keep restarting them",
    ],
    [
      "Cameras offline",
      "Several cameras are offline in the stockroom and high-value product aisles.",
      "Repair the cameras so staff can spot problems sooner.",
      "Repair the cameras",
      "Delay the repairs",
    ],
    [
      "Entrance doors failing",
      "The main entrance doors keep stopping. Customers cannot enter smoothly.",
      "Book a repair to keep the entrance working.",
      "Repair the doors",
      "Delay the repairs",
    ],
    [
      "Cooling system warning",
      "Warehouse and chilled-aisle sensors show rising temperatures.",
      "Service the cooling system before more stock is lost.",
      "Repair the cooling",
      "Monitor and wait",
    ],
  ],
  delivery: [
    [
      "A late warehouse truck",
      "The warehouse truck is stuck in traffic. Several aisles need its stock.",
      "Use a backup supplier to get replacement stock sooner.",
      "Use backup supply",
      "Wait for the truck",
    ],
    [
      "Storm delays",
      "Bad weather is delaying trucks while customers buy more everyday products.",
      "Use a backup delivery route to refill the store.",
      "Use a backup route",
      "Wait for the trucks",
    ],
    [
      "Stock at the wrong store",
      "Our delivery has arrived at another store. We need the stock before the rush.",
      "Arrange a transfer to bring the stock here sooner.",
      "Transfer the stock",
      "Wait for the next route",
    ],
    [
      "Pallets missing",
      "Several pallets are missing from a warehouse delivery. The store needs those products.",
      "Order replacement stock from a backup supplier.",
      "Replace the stock",
      "Sell what we have",
    ],
    [
      "Two deliveries late",
      "Two large deliveries are late. Several departments are running low on stock.",
      "Use backup supply to keep the store stocked.",
      "Use backup supply",
      "Wait and save cash",
    ],
  ],
  cash: [
    [
      "Large bills due",
      "Rent and operating bills are due. Too much cash is tied up in unsold stock.",
      "Sell slow-selling stock at a discount to pay the bills.",
      "Sell slow stock",
      "Keep the stock",
    ],
    [
      "Costs rising",
      "Supplier and operating costs are rising. Slow-selling products are taking up cash.",
      "Sell slow stock and focus on products that sell faster.",
      "Clear slow products",
      "Keep the full range",
    ],
    [
      "Supplier invoices due",
      "Several large supplier invoices are due at the same time. Available cash is low.",
      "Sell slow stock to free cash for the invoices.",
      "Free cash from stock",
      "Keep the stock",
    ],
    [
      "Cash tied up in stock",
      "The warehouse is full, but the business has little cash for new orders.",
      "Run a clearance on slow-selling products.",
      "Clear slow stock",
      "Wait for normal sales",
    ],
    [
      "Payroll approaching",
      "Staff wages are due soon. Unsold stock is using cash we need to pay the team.",
      "Sell slow products at a discount before payroll.",
      "Sell slow stock",
      "Wait for full-price sales",
    ],
  ],
  loyalty: [
    [
      "Reward repeat shoppers",
      "Many customers shop here regularly. A reward could encourage them to return.",
      "Offer a simple reward to returning customers.",
      "Offer customer rewards",
      "Skip the rewards",
    ],
    [
      "Member birthday offers",
      "Our loyalty members want more useful offers. Birthday discounts could help.",
      "Offer a small birthday reward to members.",
      "Offer birthday rewards",
      "Skip the rewards",
    ],
    [
      "Reusable bag rewards",
      "Customers want less packaging across store and pickup orders.",
      "Reward customers who bring reusable bags.",
      "Reward reusable bags",
      "Keep the current setup",
    ],
    [
      "A customer tasting day",
      "Customers want to try new products. A tasting day could bring them back.",
      "Host tastings across the food departments.",
      "Host the tasting day",
      "Skip the event cost",
    ],
    [
      "More local products",
      "Returning customers are asking for more products from regional suppliers.",
      "Set up a local products area to give customers a reason to return.",
      "Add a local products area",
      "Keep the current range",
    ],
  ],
  resilience: [
    [
      "Busy aisles, missed alerts",
      "Busy checkout and stockroom teams are missing security warnings.",
      "Connect the alerts so the right team can respond sooner.",
      "Connect the alerts",
      "Use current checks",
    ],
    [
      "Prepare for a busy day",
      "Demand is less predictable. Staff and systems may struggle during a sudden rush.",
      "Fund backup support for store operations and security.",
      "Add backup support",
      "Keep the cash",
    ],
    [
      "Network keeps dropping",
      "Network problems are interrupting payments, orders, and security alerts.",
      "Add a backup connection to keep store systems working.",
      "Add a backup connection",
      "Wait for recovery",
    ],
    [
      "Returns during long queues",
      "Unusual returns rise when checkout queues are long. Separate teams are missing the link.",
      "Connect queue and return alerts so staff can check the pattern.",
      "Connect the alerts",
      "Keep separate checks",
    ],
    [
      "Several problems at once",
      "High demand, long queues, late trucks, and security warnings are arriving together.",
      "Fund a shared response so store teams can act together.",
      "Coordinate the teams",
      "Keep the cash",
    ],
  ],
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
      "Teams spot problems sooner with connected alerts and backup support.",
      {
        fraud: -0.5,
        equipment: 8,
      },
    ),
    reject: fx(
      [0, -7, 1, 5],
      "We save cash, but teams still face the same risks.",
      { fraud: 0.6 },
    ),
    opinion: "Backup support helps prevent larger losses later.",
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
        minDay: i < 3 ? 1 : i - 1,
        threshold: i * 0.12,
      }),
    );
  },
);
