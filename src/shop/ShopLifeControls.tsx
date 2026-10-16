import {
  Coffee,
  Croissant,
  MonitorPlay,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  activeSecurityCase,
  personName,
  type StoreCommand,
  type StoreState,
} from "../simulation/store";
import { PersonPortrait } from "./PersonPortrait";
type Props = {
  state: StoreState;
  command: (command: StoreCommand) => void;
  onClose: () => void;
};
export function PromotionInspector({ state, command, onClose }: Props) {
  return (
    <section className="inspector life-inspector" aria-label="Promotion screen">
      <div className="section-heading">
        <span className="eyebrow">THE SHOP SCREEN</span>
        <button
          className="icon-button"
          aria-label="Close inspector"
          onClick={onClose}
        >
          <X size={17} />
        </button>
      </div>
      <div className="life-display">
        <MonitorPlay size={26} />
        <strong>
          {state.promotion === "bakery"
            ? "Bakery treats · −20%"
            : state.promotion === "lunch"
              ? "Lunch picks · −15%"
              : "Hello, neighbour!"}
        </strong>
        <span>ABC Shop</span>
      </div>
      <h2>Catch their eye</h2>
      <p className="muted">
        Choose what shoppers see. Watch them notice the screen and head to the
        offer.
      </p>
      <div className="campaign-options">
        <button
          aria-pressed={state.promotion === "bakery"}
          onClick={() => command({ type: "promotion", promotion: "bakery" })}
        >
          <Croissant size={19} />
          <span>
            <strong>Bakery treats</strong>
            <small>20% off bakery · lower margin, less chance of waste</small>
          </span>
        </button>
        <button
          aria-pressed={state.promotion === "lunch"}
          onClick={() => command({ type: "promotion", promotion: "lunch" })}
        >
          <Coffee size={19} />
          <span>
            <strong>Lunch picks</strong>
            <small>15% off sandwiches, salad bowls and juice</small>
          </span>
        </button>
        <button
          aria-pressed={state.promotion === "welcome"}
          onClick={() => command({ type: "promotion", promotion: "welcome" })}
        >
          <MonitorPlay size={19} />
          <span>
            <strong>Just a warm welcome</strong>
            <small>Stop advertising a campaign</small>
          </span>
        </button>
      </div>
      <p className="fine-print">
        Screen, shelf, checkout and online prices stay in sync.{" "}
        {state.mealActive
          ? "The agent-approved bakery deal stays active even when the screen changes."
          : "A sale is counted only when a shopper pays."}
      </p>
    </section>
  );
}
export function SecurityInspector({ state, command, onClose }: Props) {
  const guard = state.people.find((p) => p.job === "security")!,
    c = activeSecurityCase(state),
    last = state.securityCases.at(-1);
  const shopper = state.people.find((p) => p.id === c?.shopperId);
  return (
    <section
      className="inspector life-inspector"
      aria-label="Friendly security"
    >
      <div className="section-heading">
        <span className="eyebrow">A FRIENDLY EYE</span>
        <button
          className="icon-button"
          aria-label="Close inspector"
          onClick={onClose}
        >
          <X size={17} />
        </button>
      </div>
      <div className="person-identity">
        <PersonPortrait person={guard} />
        <div>
          <h2>Rémi</h2>
          <span>Security guard · Always happy to help</span>
        </div>
      </div>
      <p className="person-current">
        <ShieldCheck size={17} />
        {!c
          ? "A little patrol, a lot of good mornings."
          : c.stage === "waiting"
            ? "A shopper could use a hand."
            : c.stage === "checking"
              ? "All together now: bag, basket, receipt!"
              : "Walking over to help."}
      </p>
      {c ? (
        <>
          <h3>
            {c.kind === "receipt"
              ? c.origin === "exit-attempt"
                ? "An unpaid basket at the exit"
                : "One item still needs paying"
              : c.kind === "bag"
                ? "A forgotten bag"
                : "A friendly receipt check"}
          </h3>
          <p className="muted">
            {personName(shopper!)} ·{" "}
            {c.kind === "receipt"
              ? c.origin === "exit-attempt"
                ? `Exit, basket and purchase events show ${shopper!.basket.reduce((n, l) => n + l.quantity, 0)} unpaid items and no matching payment. Rémi will send the shopper back to an open checkout.`
                : "Basket and receipt events show one unscanned item. Rémi can check and offer handheld payment."
              : c.kind === "bag"
                ? `The bag is already paid. Receipt #${c.transactionId} helps Rémi find its owner.`
                : `Receipt #${c.transactionId} matches the basket. A quick thank-you is all that is needed.`}
          </p>
          <div className="person-actions">
            <button
              disabled={c.stage !== "waiting"}
              onClick={() => command({ type: "security-check", caseId: c.id })}
            >
              {c.kind === "bag" ? (
                <ShoppingBag size={18} />
              ) : (
                <ShieldCheck size={18} />
              )}
              <span>
                {c.kind === "bag"
                  ? "Return the forgotten bag"
                  : "Make a friendly receipt check"}
              </span>
            </button>
            {c.kind === "receipt" && (
              <button
                disabled={c.stage !== "waiting"}
                onClick={() =>
                  command({ type: "security-checkout", caseId: c.id })
                }
              >
                Guide shopper back to checkout
              </button>
            )}
          </div>
          <p className="fine-print">
            Rémi also helps on his own. No accusations, just a friendly check
            and a practical fix.
          </p>
        </>
      ) : (
        <p className="muted">
          Watch for a receipt check or a forgotten bag near the exit. Click Rémi
          whenever you want to see what he is doing.
        </p>
      )}
      {last?.outcome && (
        <div className="life-outcome">
          <ShieldCheck size={17} />
          <span>{last.outcome}</span>
        </div>
      )}
    </section>
  );
}
