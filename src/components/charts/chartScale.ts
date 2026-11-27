/** Round axis maximum with 4 even steps, e.g. 7 → 8, 27 → 40. */
export function niceMax(value: number): number {
  if (!(value > 0)) return 4
  const raw = value / 4
  const power = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? raw
  return Math.max(Number.isInteger(step) ? step : Math.ceil(step), 1) * 4
}

export function ticks(max: number): number[] {
  return [0, 1, 2, 3, 4].map((i) => (max * i) / 4)
}
