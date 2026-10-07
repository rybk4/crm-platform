export interface TrendPoint {
  label: string
  value: number
}

export interface TrendChartProps {
  points: readonly TrendPoint[]
  ariaLabel: string
  formatValue: (value: number) => string
  /** Подпись отметки оси: короче значения в подсказке. */
  formatAxisValue?: (value: number) => string
  height?: number
}
