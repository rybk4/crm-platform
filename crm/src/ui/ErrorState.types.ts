import type { IconName } from './Icon'

export interface ErrorStateProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  icon?: IconName
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  details?: string
}
