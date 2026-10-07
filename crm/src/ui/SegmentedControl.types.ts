import type { IconName } from './Icon'

export interface SegmentedOption {
  value: string
  label: string
  icon?: IconName
}

export interface SegmentedControlProps {
  ariaLabel: string
  value: string
  options: readonly SegmentedOption[]
  onChange: (value: string) => void
  /** Иконка без подписи: текст остаётся доступным для скринридера. */
  iconOnly?: boolean
}
