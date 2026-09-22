import MuiButton from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import type { ReactNode } from 'react'

interface ButtonProps {
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

export function Button({
  children,
  type = 'button',
  kind = 'primary',
  className,
  fullWidth = false,
  loading = false,
  disabled = false,
  startIcon,
  ariaLabel,
  onClick,
}: ButtonProps) {
  return (
    <MuiButton
      type={type}
      className={className}
      variant={kind === 'primary' || kind === 'danger' ? 'contained' : kind === 'outline' ? 'outlined' : 'text'}
      color={kind === 'danger' ? 'error' : 'primary'}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? <CircularProgress color="inherit" size={18} /> : startIcon}
      aria-label={ariaLabel}
    >
      {children}
    </MuiButton>
  )
}
