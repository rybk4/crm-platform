import type { IconName } from './Icon'

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export interface StatusPillProps {
  label: string
  tone?: StatusTone
  icon?: IconName
  size?: 'sm' | 'md'
}
