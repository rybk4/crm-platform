import type { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  title?: string
  hint?: string
  actions?: ReactNode
  className?: string
}
