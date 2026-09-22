import MuiIconButton from '@mui/material/IconButton'
import type { ReactNode } from 'react'

interface IconButtonProps {
  ariaLabel: string
  children: ReactNode
  className?: string
  title?: string
  ariaControls?: string
  expanded?: boolean
  onClick: () => void
}

export function IconButton({
  ariaLabel,
  children,
  className,
  title,
  ariaControls,
  expanded,
  onClick,
}: IconButtonProps) {
  return (
    <MuiIconButton
      className={className}
      aria-label={ariaLabel}
      aria-controls={ariaControls}
      aria-expanded={expanded}
      title={title}
      onClick={onClick}
    >
      {children}
    </MuiIconButton>
  )
}
