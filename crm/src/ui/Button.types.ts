import type { ReactNode } from 'react'

export interface ButtonProps {
  children: ReactNode
  type?: 'button' | 'submit'
  kind?: 'primary' | 'quiet' | 'outline' | 'danger'
  className?: string
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
  startIcon?: ReactNode
  ariaLabel?: string
  onClick?: () => void
}
