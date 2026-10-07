import type { ReactNode } from 'react'

export interface AlertProps {
  children: ReactNode
  tone?: 'error' | 'info'
}
