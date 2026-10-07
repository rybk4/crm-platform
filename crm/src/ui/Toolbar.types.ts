import type { ReactNode } from 'react'

export interface ToolbarProps {
  children: ReactNode
  /** Раскладку полей задаёт раздел: здесь только подложка и отступы. */
  className?: string
}

export interface ToolbarFieldProps {
  label: string
  value: string
  hint?: string
}
