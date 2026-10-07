import type { ReactNode } from 'react'

export interface SidePanelProps {
  open: boolean
  title: string
  closeLabel: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}
