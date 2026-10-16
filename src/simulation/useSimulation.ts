import { useCallback, useEffect, useRef, useState } from "react";
import {
  advance,
  createStore,
  decide,
  type DecisionKind,
  type StoreState,
} from "./store";
export function useSimulation(overlayOpen: boolean) {
  const store = useRef<StoreState>(null!);
  if (!store.current) store.current = createStore();
  const [snapshot, setSnapshot] = useState({ ...store.current });
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const running = playing && !overlayOpen;
  const runningRef = useRef(running);
  runningRef.current = running;
  useEffect(() => {
    if (!running) return;
    let previous = performance.now(),
      accumulated = 0;
    const timer = window.setInterval(() => {
      const now = performance.now();
      accumulated += Math.min((now - previous) / 1000, 0.5) * speed;
      previous = now;
      while (accumulated >= 0.1) {
        advance(store.current, 0.1);
        accumulated -= 0.1;
      }
      setSnapshot({ ...store.current });
    }, 100);
    return () => clearInterval(timer);
  }, [running, speed]);
  const choose = useCallback((id: DecisionKind, accept: boolean) => {
    const result = decide(store.current, id, accept);
    setSnapshot({ ...store.current });
    return result;
  }, []);
  const reset = useCallback(() => {
    store.current = createStore();
    setSnapshot({ ...store.current });
  }, []);
  return {
    store,
    snapshot,
    playing,
    setPlaying,
    speed,
    setSpeed,
    running,
    runningRef,
    choose,
    reset,
  };
}
