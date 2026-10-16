import { useState } from "react";
import {
  X,
  Hand,
  MessageCircle,
  Sparkles,
  ShoppingBasket,
  Brush,
  PackageOpen,
} from "lucide-react";
import {
  DEPARTMENTS,
  personName,
  personActivity,
  type StoreCommand,
  type StoreState,
} from "../simulation/store";
type Command = (command: StoreCommand) => void;
export function PersonInspector({
  id,
  state,
  onClose,
  command,
}: {
  id: number;
  state: StoreState;
  onClose: () => void;
  command: Command;
}) {
  const p = state.people.find((p) => p.id === id)!;
  const [department, setDepartment] = useState("bakery");
  const active = state.activities.find((a) => a.id === p.activityId);
  const busy =
    !!p.taskId ||
    !!active ||
    !["shopping", "picking", "entering", "working"].includes(p.stage) ||
    (p.role === "employee" && p.id < 102);
  return (
    <section className="inspector person-inspector" aria-label="Person actions">
      <div className="section-heading">
        <span className="eyebrow">A LITTLE SHOP LIFE</span>
        <button
          className="icon-button"
          aria-label="Close inspector"
          onClick={onClose}
        >
          <X size={17} />
        </button>
      </div>
      <div className="person-identity">
        <span className="person-avatar" style={{ background: p.outfit }}>
          <span style={{ background: p.skin }} />
        </span>
        <div>
          <h2>{personName(p)}</h2>
          <span>
            {p.role === "shopper" ? "Shopper" : "Store colleague"} ·{" "}
            {["Curious", "Chatty", "Easygoing", "Playful"][p.id % 4]}
          </span>
        </div>
      </div>
      <p className="person-current" data-testid="person-activity">
        {personActivity(state, p)}
      </p>
      {active?.stage === "active" && (
        <p className="person-quote">“{active.line}”</p>
      )}
      <div className="person-actions">
        <button
          onClick={() => command({ type: "wave", personId: id })}
          disabled={p.stage === "outside"}
        >
          <Hand size={17} />
          <span>Wave hello</span>
        </button>
        <button
          onClick={() => command({ type: "chat", personId: id })}
          disabled={busy}
        >
          <MessageCircle size={17} />
          <span>
            {p.role === "employee"
              ? "Have a friendly chat"
              : "Say hello to someone"}
          </span>
        </button>
        <button
          onClick={() => command({ type: "dance", personId: id })}
          disabled={busy}
        >
          <Sparkles size={17} />
          <span>Do a happy dance</span>
        </button>
      </div>
      <label className="person-destination">
        {p.role === "shopper" ? "Explore an aisle" : "Care for a display"}
        <select
          aria-label="Choose an aisle"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          {DEPARTMENTS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <button
        className="secondary person-go"
        disabled={busy}
        onClick={() =>
          command(
            p.role === "shopper"
              ? { type: "browse", personId: id, departmentId: department }
              : { type: "tidy", personId: id, departmentId: department },
          )
        }
      >
        {p.role === "shopper" ? (
          <ShoppingBasket size={16} />
        ) : (
          <Brush size={16} />
        )}
        {p.role === "shopper" ? "Go browse this aisle" : "Tidy this display"}
      </button>
      {busy && (
        <p className="fine-print">
          Let them finish this little moment. You can still wave hello.
        </p>
      )}
      {p.role === "shopper" && (
        <div className="person-basket">
          <span className="eyebrow">
            IN THE BASKET · {p.basket.reduce((n, l) => n + l.quantity, 0)}
          </span>
          <p>
            {p.basket.length
              ? p.basket
                  .map(
                    (l) =>
                      state.products.find((v) => v.id === l.productId)!.name,
                  )
                  .join(", ")
              : "A fresh basket, ready for good finds."}
          </p>
        </div>
      )}
    </section>
  );
}
export function ShelfActions({
  id,
  command,
}: {
  id: string;
  command: Command;
}) {
  return (
    <div className="shelf-play" aria-label="Shelf actions">
      <span className="eyebrow">PLAY WITH THIS AISLE</span>
      <div className="person-actions">
        <button onClick={() => command({ type: "browse", departmentId: id })}>
          <ShoppingBasket size={16} />
          Send a shopper here
        </button>
        <button onClick={() => command({ type: "tidy", departmentId: id })}>
          <Brush size={16} />
          Tidy this display
        </button>
        <button onClick={() => command({ type: "wobble", departmentId: id })}>
          <PackageOpen size={16} />A little shelf wobble
        </button>
      </div>
    </div>
  );
}
export function FloorInspector({
  id,
  state,
  command,
  onClose,
}: {
  id: number;
  state: StoreState;
  command: Command;
  onClose: () => void;
}) {
  const item = state.floorItems.find((i) => i.id === id),
    product = state.products.find((p) => p.id === item?.productId);
  return (
    <section className="inspector" aria-label="Dropped item">
      <div className="section-heading">
        <span className="eyebrow">A LITTLE MISHAP</span>
        <button
          className="icon-button"
          aria-label="Close inspector"
          onClick={onClose}
        >
          <X size={17} />
        </button>
      </div>
      <h2>Oops, {product?.name.toLowerCase() ?? "a tumble"}!</h2>
      <p className="muted">
        {!item || item.status === "cleared"
          ? "All clear. A colleague has tidied this spot."
          : item.status === "assigned"
            ? "A colleague is walking over to pick this up."
            : "One item is on the floor. The store has flagged it for cleanup."}
      </p>
      <button
        className="secondary person-go"
        disabled={!item || item.status !== "waiting"}
        onClick={() => command({ type: "cleanup", itemId: id })}
      >
        <Brush size={16} />
        Ask a colleague to help
      </button>
      <p className="fine-print">
        The item stays out of saleable stock until cleanup. Open fresh food
        becomes waste; sealed goods return to the display.
      </p>
    </section>
  );
}
export function PeopleList({
  state,
  onSelect,
}: {
  state: StoreState;
  onSelect: (id: string) => void;
}) {
  return (
    <details className="people-list">
      <summary>
        <MessageCircle size={15} />
        People in the shop
        <span>{state.people.filter((p) => p.stage !== "outside").length}</span>
      </summary>
      <div>
        {state.people
          .filter((p) => p.stage !== "outside")
          .map((p) => (
            <button
              key={p.id}
              aria-label={`Select ${personName(p)}, ${p.role}`}
              onClick={() => onSelect(`person:${p.id}`)}
            >
              <i style={{ background: p.outfit }} />
              <span>
                {personName(p)}
                <small>{personActivity(state, p)}</small>
              </span>
            </button>
          ))}
      </div>
    </details>
  );
}
