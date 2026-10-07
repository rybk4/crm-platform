export interface BarItem {
  id: string
  label: string
  value: number
  valueLabel: string
  hint?: string
}

export interface BarListProps {
  items: readonly BarItem[]
  ariaLabel: string
}
