import type { ReactNode } from 'react'

export interface DialogProps {
  open: boolean
  title: string
  children: ReactNode
  actions: ReactNode
  onClose: () => void
  maxWidth?: 'sm' | 'md' | 'lg'
}
