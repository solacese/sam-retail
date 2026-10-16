import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import type { StoreState } from "../simulation/store";
import { shopContext } from "./context";
// This is a public API address. The provider credential exists only in Secrets Manager.
export const CHAT_URL =
  import.meta.env.VITE_SHOP_CHAT_URL ||
  "https://0ssj40vwy4.execute-api.ca-central-1.amazonaws.com/chat";
type Message = { role: "user" | "assistant"; content: string; at: string };
export function ShopChat({ state }: { state: StoreState }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, pending, error]);
  async function ask(text: string) {
    const query = text.trim();
    if (!query || pending) return;
    const context = shopContext(state),
      history = messages
        .slice(-6)
        .map(({ role, content }) => ({ role, content }));
    const controller = new AbortController();
    request.current = controller;
    const timer = window.setTimeout(() => controller.abort("timeout"), 30000);
    setQuestion("");
    setError("");
    setPending(true);
    setMessages((m) => [
      ...m,
      { role: "user", content: query, at: context.at },
    ]);
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: query, context, history }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || typeof result.answer !== "string")
        throw new Error(
          response.status === 429
            ? "Shop chat is busy. Please try again a little later."
            : "I could not check the shop just now. Please try again.",
        );
      if (!controller.signal.aborted)
        setMessages(
          (m) =>
            [
              ...m,
              { role: "assistant", content: result.answer, at: context.at },
            ].slice(-12) as Message[],
        );
    } catch (cause) {
      if (controller.signal.aborted && controller.signal.reason !== "timeout")
        return;
      setMessages((m) => m.slice(0, -1));
      setQuestion(query);
      setError(
        cause instanceof Error &&
          !controller.signal.aborted &&
          cause.message.startsWith("Shop chat is busy")
          ? cause.message
          : "I could not check the shop just now. Please try again.",
      );
    } finally {
      window.clearTimeout(timer);
      if (!controller.signal.aborted || controller.signal.reason === "timeout")
        setPending(false);
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    void ask(question);
  }
  return (
    <section className="shop-chat" aria-label="Ask the shop">
      <div className="chat-heading">
        <MessageCircle size={18} />
        <h2>Ask the shop</h2>
        <span>Live store info</span>
      </div>
      {!messages.length && !pending && (
        <p className="chat-intro">What’s happening in your shop?</p>
      )}
      {(messages.length > 0 || pending) && (
        <div
          className="chat-messages"
          ref={log}
          role="log"
          aria-label="Shop conversation"
          aria-live="polite"
          aria-relevant="additions text"
        >
          {messages.map((message, i) => (
            <article className={`chat-message ${message.role}`} key={i}>
              <span>
                {message.role === "user" ? "You" : "Shop assistant"}{" "}
                <time>{message.at}</time>
              </span>
              <p>{message.content}</p>
            </article>
          ))}
          {pending && (
            <p className="chat-thinking">
              <Sparkles size={14} /> Checking the shop…
            </p>
          )}
        </div>
      )}
      {!messages.length && (
        <div className="chat-suggestions" aria-label="Suggested shop questions">
          {[
            { label: "Stock", question: "What needs restocking?" },
            { label: "Incidents", question: "Any incidents?" },
            { label: "Sales", question: "How are sales?" },
          ].map((q) => (
            <button
              type="button"
              key={q.label}
              disabled={pending}
              onClick={() => void ask(q.question)}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p className="chat-error" role="alert">
          {error}
        </p>
      )}
      <form onSubmit={submit} className="chat-form">
        <textarea
          aria-label="Question about the shop"
          placeholder="Ask about your shop…"
          rows={2}
          maxLength={600}
          value={question}
          disabled={pending}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              void ask(question);
            }
          }}
        />
        <button
          type="submit"
          aria-label="Send shop question"
          disabled={pending || !question.trim()}
        >
          <Send size={18} />
        </button>
      </form>
      {messages.length > 0 && (
        <p className="chat-snapshot-note">Based on the shop when you asked.</p>
      )}
    </section>
  );
}
