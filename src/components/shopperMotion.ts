// A gently curved walk, sampled with zero velocity at either end.
export function planShopperWalk(from: number[], to: number[], index: number) {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const distance = Math.hypot(dx, dy);
  const bend = Math.min(16, distance * .09) * (index % 2 ? 1 : -1);
  const cx = (from[0] + to[0]) / 2 - dy / (distance || 1) * bend;
  const cy = (from[1] + to[1]) / 2 + dx / (distance || 1) * bend;
  const x: number[] = [], y: number[] = [];
  for (let i = 0; i <= 32; i++) {
    const t = (1 - Math.cos(Math.PI * i / 32)) / 2, u = 1 - t;
    x.push(u * u * from[0] + 2 * u * t * cx + t * t * to[0]);
    y.push(u * u * from[1] + 2 * u * t * cy + t * t * to[1]);
  }
  return { x, y, distance, duration: Math.max(.85, Math.min(2.8, distance / 75)) };
}
