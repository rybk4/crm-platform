import type { ReactNode } from 'react'
import type { IconName } from './Icon'

export interface EmptyStateProps {
  icon: IconName
  title: string
  description: string
  action?: ReactNode
}
