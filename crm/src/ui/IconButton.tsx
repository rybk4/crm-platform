import MuiIconButton from '@mui/material/IconButton'
import type { IconButtonProps } from './IconButton.types'
export type { IconButtonProps } from './IconButton.types'

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
