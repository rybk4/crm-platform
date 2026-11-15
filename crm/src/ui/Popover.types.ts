import type { ReactNode } from 'react'
export interface PopoverProps {
  anchor: HTMLElement | null
  onClose: () => void
  children: ReactNode
  label: string
}
