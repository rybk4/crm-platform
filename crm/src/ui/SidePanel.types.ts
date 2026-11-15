import type { ReactNode } from 'react'
export interface SidePanelProps {
  open: boolean
  title: string
  children: ReactNode
  footer?: ReactNode
  closeLabel?: string
  onClose: () => void
  tone?: string
  floating?: boolean
}
