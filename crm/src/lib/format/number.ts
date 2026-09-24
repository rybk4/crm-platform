/** Короткая запись числа для осей и плиток: 1 250 000 → «1,3 млн». */
export function formatCompactNumber(value: number, maximumFractionDigits = 0) {
  if (!Number.isFinite(value)) return '0'

  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits,
  }).format(value)
}

/** Дробное число по правилам локали: 3.5 → «3,5» в русском. */
export function formatDecimal(value: number, maximumFractionDigits = 1) {
  if (!Number.isFinite(value)) return '0'

  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value)
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}
