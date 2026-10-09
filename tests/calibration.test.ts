import { it, expect } from "vitest";
import { RetailGame } from "../src/engine/game";
it("qualifies replay diversity and a viable strategy across 100 full shifts", () => {
  const counts: Record<string, number> = {};
  let wins = 0;
  const scores: number[] = [];
  const templates = new Set<string>();
  for (let i = 0; i < 100; i++) {
    const g = new RetailGame(`CALIBRATION-${i}`);
    let s = g.snapshot();
    for (let n = 0; n < 30; n++) {
      if (s.status === "lost" || s.status === "won") break;
      const p = s.proposal!;
      counts[p.template.family] = (counts[p.template.family] ?? 0) + 1;
      templates.add(p.template.id);
      s = g.resolve(p.suggested);
      if (s.status === "report") s = g.nextDay();
      else if (s.status === "playing") s = g.nextDecision();
    }
    if (s.status === "won") wins++;
    scores.push(s.score.total);
  }
  console.log({
    wins,
    counts,
    templates: templates.size,
    scoreRange: [Math.min(...scores), Math.max(...scores)],
  });
  expect(wins).toBeGreaterThan(75);
  expect(Object.keys(counts)).toHaveLength(12);
  expect(templates.size).toBeGreaterThan(45);
});
