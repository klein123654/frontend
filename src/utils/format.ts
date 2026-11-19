const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

/** Format a price in Philippine pesos without centavos, e.g. ₱1,500,000. */
export function formatPeso(amount: number): string {
  return pesoFormatter.format(amount)
}

/** Format an area in square metres, e.g. 1,250 sq. m. */
export function formatArea(squareMetres: number): string {
  return `${squareMetres.toLocaleString('en-PH')} sq. m.`
}

/**
 * Price per square metre, e.g. "₱317 / sq. m." — how businesses compare
 * commercial spaces. Returns '' when either value is missing.
 */
export function formatPricePerSqm(price: number, squareMetres: number): string {
  if (!(price > 0) || !(squareMetres > 0)) return ''
  return `${formatPeso(Math.round(price / squareMetres))} / sq. m.`
}

/** Format a YYYY-MM-DD date as e.g. "Nov 19, 2027" without time-zone shifts. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return isoDate
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}
