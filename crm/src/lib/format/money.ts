/** Цена приходит строкой: нечисловое значение показываем как есть, а не как NaN. */
export function formatMoney(value: string | number, currency: string) {
  const amount = typeof value === 'number' ? value : Number(value)

  if (typeof value === 'string' && !value.trim()) return `${value} ${currency}`
  if (!Number.isFinite(amount)) return `${value} ${currency}`

  const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(amount)
  return `${formatted} ${currency}`
}

/** Короткая запись для осей и плиток: 1 250 000 → «1,3 млн». */
export function formatCompactMoney(value: number, currency: string) {
  if (!Number.isFinite(value)) return `0 ${currency}`

  const formatted = new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

  return `${formatted} ${currency}`
}
