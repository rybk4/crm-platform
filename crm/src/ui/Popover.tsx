import MuiPopover from '@mui/material/Popover'
import type { PopoverProps } from './Popover.types'
export function Popover({ anchor, onClose, children, label }: PopoverProps) {
  return (
    <MuiPopover
      container={() => document.querySelector('.app-theme-root')}
      open={Boolean(anchor)}
      anchorEl={anchor}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{ paper: { className: 'ui-popover', role: 'dialog', 'aria-label': label } }}
    >
      {children}
    </MuiPopover>
  )
}
