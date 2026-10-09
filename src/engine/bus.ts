import type { RetailEvent } from "./types";
export interface EventAdapter {
  publish(event: RetailEvent): void;
  subscribe(listener: (event: RetailEvent) => void): () => void;
  close(): void;
}
export class LocalEventBus implements EventAdapter {
  private listeners = new Set<(event: RetailEvent) => void>();
  publish(event: RetailEvent) {
    this.listeners.forEach((listener) => listener(event));
  }
  subscribe(listener: (event: RetailEvent) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  close() {
    this.listeners.clear();
  }
}
/** Server owns authentication, correlation and action execution. No broker secrets in the browser. */
export class BackendEventAdapter implements EventAdapter {
  private listeners = new Set<(event: RetailEvent) => void>();
  private stream: EventSource;
  constructor(private baseUrl: string) {
    const url = new URL(baseUrl);
    if (url.protocol !== "https:")
      throw new Error("Backend integration requires HTTPS.");
    this.stream = new EventSource(`${baseUrl}/events`, {
      withCredentials: true,
    });
    this.stream.onmessage = (e) => {
      const event = JSON.parse(e.data) as RetailEvent;
      this.listeners.forEach((listener) => listener(event));
    };
  }
  publish(event: RetailEvent) {
    void fetch(`${this.baseUrl}/events`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Backend returned ${r.status}`);
      })
      .catch((error) => console.error("Backend publish failed", error));
  }
  subscribe(listener: (event: RetailEvent) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  close() {
    this.stream.close();
    this.listeners.clear();
  }
}
