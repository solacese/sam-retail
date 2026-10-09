import type { AgentId, Effect, Family, SituationTemplate } from "./types";
export const AGENTS: Record<
  AgentId,
  { role: string; color: string; motto: string }
> = {
  SAM: {
    role: "General Manager",
    color: "#bca2f5",
    motto: "A little chaos. A lot of coordination.",
  },
  STOCKY: {
    role: "Inventory Agent",
    color: "#67d8bd",
    motto: "An empty shelf is a broken promise.",
  },
  PENNY: {
    role: "Finance Agent",
    color: "#f6c76d",
    motto: "Your vibes are great. Your margins?",
  },
  SHIELD: {
    role: "Security Agent",
    color: "#86b7ed",
    motto: "Trust everyone. Verify the receipts.",
  },
  SPARK: {
    role: "Marketing Agent",
    color: "#f29ba4",
    motto: "Let’s give them something to talk about.",
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
      "The milk crisis",
      "Milk is flying off the shelves. The delivery truck? Not so much.",
      "Book a small emergency delivery. Breakfast cannot wait.",
      "Rush the milk",
      "Ride out the shortage",
    ],
    [
      "The noodle stampede",
      "A local creator called our noodles “life changing.” Apparently, so did everyone else.",
      "Replenish the bestseller before the internet moves on.",
      "Restock the noodles",
      "Let the hype cool",
    ],
    [
      "Bananas for bananas",
      "The gym next door has discovered our bananas. Stock cover is getting slippery.",
      "Bring in another crate, before smoothies become sad.",
      "Order another crate",
      "Suggest other fruit",
    ],
    [
      "The empty-shelf selfie",
      "Customers are posting photos of the last lonely cereal box.",
      "Restock now. We do not need a sequel to that photo.",
      "Fill the shelf",
      "Save the delivery fee",
    ],
    [
      "The last carton",
      "A demand spike has left the essentials aisle running on fumes.",
      "Prioritize essentials over the shiny new products.",
      "Rush the essentials",
      "Keep the cash buffer",
    ],
  ],
  supplier: [
    [
      "A very big cheese",
      "Our supplier offers a bulk deal. More cheddar, both kinds.",
      "Take the discount, but watch the cold-storage space.",
      "Take the bulk deal",
      "Buy small, stay nimble",
    ],
    [
      "Mystery snack box",
      "A supplier has surplus imported snacks. The margin looks delicious.",
      "Try a modest batch. Novelty sells, until it doesn’t.",
      "Buy the snack box",
      "Stick to the classics",
    ],
    [
      "Coffee for a month",
      "Coffee costs are rising. The supplier will lock a price for a bigger order.",
      "Secure the price, even if cash takes a short-term hit.",
      "Lock in the coffee",
      "Pay as we go",
    ],
    [
      "Local heroes",
      "A nearby grower offers fresher produce, with a larger minimum order.",
      "Choose the local shipment. Quality can earn loyalty.",
      "Go local",
      "Keep our supplier",
    ],
    [
      "The warehouse clearance",
      "Our wholesaler is clearing its warehouse. Cheap stock, expensive commitment.",
      "Take the deal only if we can move it quickly.",
      "Buy the clearance",
      "Protect liquidity",
    ],
  ],
  fraud: [
    [
      "The receipt magician",
      "One customer has returned the same blender three times. Impressive. Suspicious.",
      "Verify receipts before accepting another return.",
      "Verify the return",
      "Keep returns frictionless",
    ],
    [
      "Self-checkout surprise",
      "The avocado button is being used for rather expensive olive oil.",
      "Add a friendly spot-check at self-checkout.",
      "Check the baskets",
      "Keep the queue moving",
    ],
    [
      "Coupon deja vu",
      "The same “single-use” coupon keeps coming back in different jackets.",
      "Enable coupon validation before the next rush.",
      "Validate coupons",
      "Honor the discounts",
    ],
    [
      "The gift-card shuffle",
      "Gift-card purchases and instant refunds have formed a curious little loop.",
      "Hold unusual refunds for a manager review.",
      "Review the refunds",
      "Process them quickly",
    ],
    [
      "Five-finger discount",
      "High-value items are disappearing faster than sales can explain.",
      "Move premium stock closer to the till.",
      "Secure the display",
      "Keep the open display",
    ],
  ],
  review: [
    [
      "One star, five paragraphs",
      "A customer wrote an essay about a missing oat milk. The ending is not flattering.",
      "Make it right with a refund and a personal reply.",
      "Make it right",
      "Explain our policy",
    ],
    [
      "The warm ice cream",
      "Our freezer hiccup has made someone’s rocky road a literal rocky road.",
      "Replace the purchase and own the mistake.",
      "Replace and apologize",
      "Offer store credit later",
    ],
    [
      "Price-tag drama",
      "The shelf price and till price disagree. The customer has brought an audience.",
      "Honor the shelf price and check the labels.",
      "Honor the shelf price",
      "Stand by the till price",
    ],
    [
      "The missing sandwich",
      "A pickup customer got a bag, a receipt, and absolutely no sandwich.",
      "Remake the order with a little extra kindness.",
      "Remake the order",
      "Refund the sandwich only",
    ],
    [
      "A neighborhood thread",
      "A negative review is becoming the neighborhood’s favorite discussion.",
      "Turn criticism into a visible service improvement.",
      "Invest in service",
      "Reply without spending",
    ],
  ],
  promotion: [
    [
      "Happy hour, hungry crowd",
      "The afternoon is quiet. A flash deal could make it considerably less quiet.",
      "Run a short promotion. Be ready for the stampede.",
      "Launch happy hour",
      "Keep normal prices",
    ],
    [
      "Two for the road",
      "Commuters are passing us by. A two-for-one snack offer might stop them.",
      "Bundle the snacks and capture the evening rush.",
      "Launch the bundle",
      "Protect the margin",
    ],
    [
      "The lunch takeover",
      "The office upstairs is ordering lunch. We could become their new habit.",
      "Offer a lunch deal while the opportunity is warm.",
      "Win the lunch crowd",
      "Stay with walk-ins",
    ],
    [
      "Going a little viral",
      "A local creator wants to feature the shop. Payment is in free groceries.",
      "Trade a small basket for a bigger audience.",
      "Say yes to the creator",
      "Pass on the spotlight",
    ],
    [
      "Midnight munchies",
      "The nearby event has an afterparty. We have snacks. This feels like destiny.",
      "Launch a limited late-night offer.",
      "Promote the snack run",
      "Keep a quiet evening",
    ],
  ],
  staff: [
    [
      "The queue has a queue",
      "Checkout is backing up. Someone has started naming the queue.",
      "Bring in temporary cover before “Queuebert” gets a review.",
      "Call in extra help",
      "Work through the rush",
    ],
    [
      "The disappearing lunch break",
      "Our cashier has been covering two roles and zero lunch breaks.",
      "Pay for shift cover. Humans need sandwiches too.",
      "Cover the break",
      "Delay it until quieter",
    ],
    [
      "First-day jitters",
      "Our new teammate is learning the till while the rush learns impatience.",
      "Pair them with an experienced cashier.",
      "Add a training shift",
      "Learn on the job",
    ],
    [
      "Saturday skeleton crew",
      "The rota has holes. The Saturday forecast has none.",
      "Book extra cover while we still have a choice.",
      "Book the shift",
      "Stretch the team",
    ],
    [
      "Pickup pile-up",
      "Online pickup bags are piling up behind the checkout.",
      "Assign a teammate to pickup orders.",
      "Staff the pickup desk",
      "Share the checkout team",
    ],
  ],
  waste: [
    [
      "Avocado o’clock",
      "The avocados have entered their brief, dramatic window of perfection.",
      "Mark them down before perfection becomes compost.",
      "Mark down the batch",
      "Hold the full price",
    ],
    [
      "Bread today, gone tomorrow",
      "There is more fresh bread than fresh demand.",
      "Sell a bakery bundle before closing.",
      "Bundle the bread",
      "Wait for late shoppers",
    ],
    [
      "The yogurt countdown",
      "A few yogurt trays are approaching their best-before finale.",
      "Offer a short-date discount and recover some cash.",
      "Discount the trays",
      "Keep the full margin",
    ],
    [
      "Too much of a good thing",
      "That big produce order looked clever. Now the freshness clock is loud.",
      "Move excess stock with a transparent clearance.",
      "Clear the excess",
      "Wait for demand",
    ],
    [
      "The rescue bag",
      "Fresh stock is ageing. A surprise grocery bag could give it a second act.",
      "Sell discounted rescue bags and reduce waste.",
      "Sell rescue bags",
      "Keep normal sales",
    ],
  ],
  equipment: [
    [
      "Freezer takes a vacation",
      "The freezer temperature is climbing. The ice cream is deeply concerned.",
      "Book a repair before inventory turns liquid.",
      "Fix the freezer",
      "Use a temporary workaround",
    ],
    [
      "The till is thinking",
      "Our payment terminal is buffering like it’s 2004.",
      "Replace the terminal and restore checkout speed.",
      "Replace the terminal",
      "Keep rebooting it",
    ],
    [
      "Lights, camera, no action",
      "A security camera has quietly retired without telling anyone.",
      "Repair the camera before a blind spot becomes a loss.",
      "Repair the camera",
      "Use staff patrols",
    ],
    [
      "Door with an attitude",
      "The automatic door has become extremely selective about who may enter.",
      "Get a technician. Our door is not a bouncer.",
      "Fix the entrance",
      "Prop it open for now",
    ],
    [
      "Cold chain, hot problem",
      "Storage sensors show a temperature drift across the chilled aisle.",
      "Service the cooling system and protect the stock.",
      "Service the cooling",
      "Monitor and wait",
    ],
  ],
  delivery: [
    [
      "Truck in traffic",
      "The replenishment truck is stuck. Our shelves are less patient than the driver.",
      "Split a small order to a backup supplier.",
      "Use a backup supplier",
      "Wait for the truck",
    ],
    [
      "Rain on our parade",
      "A storm has delayed deliveries and lifted demand for essentials.",
      "Pay for a local courier to bridge the gap.",
      "Book a local courier",
      "Wait out the storm",
    ],
    [
      "Wrong side of town",
      "Our shipment has arrived safely. At a completely different store.",
      "Arrange a transfer before the rush hits.",
      "Transfer the shipment",
      "Wait for the next route",
    ],
    [
      "A missing pallet",
      "The delivery is here. The most important pallet is not.",
      "Place a targeted replacement order.",
      "Replace the pallet",
      "Sell what we have",
    ],
    [
      "Supply chain plot twist",
      "Two late deliveries have become one very late delivery.",
      "Activate the backup route and protect availability.",
      "Activate backup supply",
      "Conserve the cash",
    ],
  ],
  cash: [
    [
      "Rent remembers",
      "The rent is due. Cash is looking a little too philosophical.",
      "Liquidate slow stock and rebuild the cash buffer.",
      "Sell slow stock cheaply",
      "Keep the inventory",
    ],
    [
      "Margins on a diet",
      "Costs are rising faster than prices. Our profit has lost its appetite.",
      "Trim the slow assortment and recover working capital.",
      "Trim the assortment",
      "Keep the full range",
    ],
    [
      "The invoice mountain",
      "Supplier invoices are arriving together. Lovely teamwork. Terrible timing.",
      "Free cash from low-turnover inventory.",
      "Release working capital",
      "Hold the stock",
    ],
    [
      "Coins in the cushion",
      "We have stock, customers, and surprisingly little spendable cash.",
      "Run a targeted clearance to buy breathing room.",
      "Create a cash buffer",
      "Bet on regular sales",
    ],
    [
      "Payroll pressure",
      "Payroll is coming. A shelf full of fancy sauces will not pay it.",
      "Convert slow stock into cash before payroll.",
      "Clear the slow movers",
      "Wait for full-price sales",
    ],
  ],
  loyalty: [
    [
      "The regulars club",
      "Our returning customers are growing. They’d appreciate a little recognition.",
      "Launch a simple loyalty reward for regular shoppers.",
      "Reward the regulars",
      "Keep it simple",
    ],
    [
      "Birthday groceries",
      "A loyal customer is celebrating. We could make their day for a small cost.",
      "Add a little birthday perk. Neighbors remember.",
      "Add a birthday perk",
      "Send good wishes",
    ],
    [
      "Bring your own bag",
      "Customers want less packaging. A refill perk could bring them back.",
      "Reward reusable bags and build a greener habit.",
      "Launch the refill perk",
      "Keep our usual setup",
    ],
    [
      "Meet the neighbors",
      "The neighborhood group wants a tiny tasting event in our shop.",
      "Host it. Tiny cheese cubes, lasting goodwill.",
      "Host the tasting",
      "Skip the event cost",
    ],
    [
      "The community shelf",
      "Regulars want local products. A small community shelf could become a favorite.",
      "Give local makers a little space and visibility.",
      "Build the local shelf",
      "Keep the bestsellers",
    ],
  ],
  resilience: [
    [
      "Eyes on the aisle",
      "A busy store and thin staffing have opened a few avoidable blind spots.",
      "Set up a security alert policy with clear limits.",
      "Enable better alerts",
      "Rely on the team",
    ],
    [
      "Backup plan, main character",
      "Forecast volatility is rising. The shop needs a plan B.",
      "Invest in a small operational safety buffer.",
      "Build a safety buffer",
      "Stay lean",
    ],
    [
      "The Wi-Fi wobble",
      "Connectivity keeps dropping just when transactions get interesting.",
      "Install a backup connection and keep receipts flowing.",
      "Add a backup link",
      "Wait for recovery",
    ],
    [
      "A suspicious coincidence",
      "Returns spike exactly when the queue gets long. That feels a little coordinated.",
      "Correlate returns with checkout pressure and flag anomalies.",
      "Connect the alerts",
      "Handle each separately",
    ],
    [
      "The perfect storm",
      "High demand, stretched staff, and shaky supply are arriving together.",
      "Fund a coordinated response with security and operations.",
      "Coordinate the response",
      "Preserve the cash",
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
      "The rush order is confirmed. Relief is on its way.",
      { delivery: 9 },
    ),
    reject: fx(
      [-8, 0, -3, 4],
      "Cash stays safe. The shelf will have to stretch.",
      { demand: -0.1 },
    ),
    opinion: "Customers can’t buy a promise. We need stock.",
    peerOpinion: "Emergency shipping is eating our margin. Watch the cash.",
  },
  supplier: {
    agent: "STOCKY",
    peer: "PENNY",
    approve: fx(
      [13, 0, 2, -7],
      "The bulk order lands. Bigger shelves, tighter cash.",
      { waste: 5, delivery: 5 },
    ),
    reject: fx([-3, 1, 0, 5], "We stay flexible and pay the usual price.", {
      margin: -0.02,
    }),
    opinion: "More stock, better unit price. What’s not to like?",
    peerOpinion: "Spoilage. Storage. Cash tied up. Shall I keep going?",
  },
  fraud: {
    agent: "SHIELD",
    peer: "SPARK",
    approve: fx(
      [1, 15, -2, -7],
      "Checks are in place. Losses fall; checkout slows.",
      { fraud: -1 },
    ),
    reject: fx(
      [-3, -9, 4, 4],
      "Checkout stays friendly. Unverified returns stay risky.",
      { fraud: 1 },
    ),
    opinion: "That pattern isn’t luck. We need a check.",
    peerOpinion: "Make it friendly. Nobody enjoys being treated as a suspect.",
  },
  review: {
    agent: "SPARK",
    peer: "PENNY",
    approve: fx(
      [0, 0, 15, -7],
      "The customer feels heard. Word starts to turn around.",
      { loyalty: 0.12 },
    ),
    reject: fx(
      [0, 1, -7, 4],
      "The policy stands. The review is still circulating.",
      { loyalty: -0.12 },
    ),
    opinion: "One unhappy customer can become an entire comment section.",
    peerOpinion: "A refund today is a cost. Make sure it buys trust tomorrow.",
  },
  promotion: {
    agent: "SPARK",
    peer: "STOCKY",
    approve: fx(
      [-6, -2, 9, 10],
      "The offer is live. Shoppers, sales, and pressure climb.",
      { promotion: 3, demand: 0.4 },
    ),
    reject: fx(
      [3, 2, -4, -2],
      "A quiet aisle, a healthy stock buffer, a missed opportunity.",
      { demand: -0.12 },
    ),
    opinion: "This is our moment. Let’s get people through the door.",
    peerOpinion: "Great. Do we have enough products for those people?",
  },
  staff: {
    agent: "SAM",
    peer: "PENNY",
    approve: fx(
      [1, 3, 10, -8],
      "Extra hands arrive. The queue finally has an ending.",
      { staff: 1 },
    ),
    reject: fx(
      [0, -4, -7, 5],
      "Payroll stays lean. Our team carries the pressure.",
      { staff: -0.3 },
    ),
    opinion: "A shorter queue is good for customers and the team.",
    peerOpinion: "Extra shifts are real costs. Is this rush going to last?",
  },
  waste: {
    agent: "STOCKY",
    peer: "PENNY",
    approve: fx(
      [-6, 0, 5, 9],
      "Short-date stock moves. Less waste, a little more cash.",
      { waste: -8 },
    ),
    reject: fx(
      [2, 0, -3, 2],
      "Full prices hold. The freshness clock keeps ticking.",
      { waste: 7 },
    ),
    opinion: "Sell it while it’s good. Tomorrow it’s a compost story.",
    peerOpinion: "A discount hurts margin. Waste hurts it more.",
  },
  equipment: {
    agent: "SHIELD",
    peer: "PENNY",
    approve: fx(
      [5, 6, 3, -9],
      "The repair is booked. Equipment is back in the game.",
      { equipment: 28 },
    ),
    reject: fx(
      [-3, -4, -2, 5],
      "The workaround saves money and buys a little time.",
      { equipment: -12, waste: 4 },
    ),
    opinion: "A failing system becomes a failing shelf.",
    peerOpinion: "Could the temporary fix get us through today?",
  },
  delivery: {
    agent: "STOCKY",
    peer: "PENNY",
    approve: fx(
      [14, 0, 4, -8],
      "Backup supply is confirmed. Shelves get a second chance.",
      { delivery: 10, delay: -35 },
    ),
    reject: fx(
      [-7, 0, -3, 5],
      "The original truck is still on its way. Eventually.",
      { delay: 15 },
    ),
    opinion: "The customers are here. Our delivery isn’t.",
    peerOpinion: "Paying twice for delivery is a very expensive habit.",
  },
  cash: {
    agent: "PENNY",
    peer: "STOCKY",
    approve: fx(
      [-8, 1, -3, 18],
      "Slow stock becomes working capital. We can breathe again.",
      { margin: 0.025 },
    ),
    reject: fx(
      [4, 0, 2, -7],
      "The assortment survives. Cash remains under pressure.",
      { margin: -0.02 },
    ),
    opinion: "We need spendable money, not theoretical shelf value.",
    peerOpinion: "Selling down stock can create the next shortage.",
  },
  loyalty: {
    agent: "SPARK",
    peer: "PENNY",
    approve: fx(
      [0, 1, 12, -6],
      "Regulars get a reason to return. Goodwill builds.",
      { loyalty: 0.18 },
    ),
    reject: fx(
      [1, 1, -3, 4],
      "No extra perks today. The budget gets a little love.",
      { loyalty: -0.05 },
    ),
    opinion: "A regular customer is a hundred future decisions.",
    peerOpinion: "Only if the rewards don’t eat all hundred margins.",
  },
  resilience: {
    agent: "SHIELD",
    peer: "PENNY",
    approve: fx([0, 12, 3, -9], "Connected alerts catch trouble earlier.", {
      fraud: -0.5,
      equipment: 8,
    }),
    reject: fx(
      [0, -7, 1, 5],
      "The cash buffer holds. Risk stays with the team.",
      { fraud: 0.6 },
    ),
    opinion: "Small safeguards now. Fewer expensive surprises later.",
    peerOpinion: "A safety buffer is still a purchase. Keep it proportionate.",
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
