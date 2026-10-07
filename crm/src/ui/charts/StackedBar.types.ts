import type { StatusTone } from '../StatusPill'

export interface StackedSegment {
  id: string
  label: string
  value: number
  valueLabel: string
  tone: StatusTone
}

export interface StackedBarProps {
  segments: readonly StackedSegment[]
  ariaLabel: string
}
