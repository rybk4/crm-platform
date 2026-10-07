import type { ReactNode } from 'react'

export interface IconButtonProps {
  ariaLabel: string
  children: ReactNode
  className?: string
  title?: string
  ariaControls?: string
  expanded?: boolean
  onClick: () => void
}
