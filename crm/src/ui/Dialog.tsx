import MuiDialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import type { ReactNode } from 'react'

interface DialogProps {
  open: boolean
  title: string
  children: ReactNode
  actions: ReactNode
  onClose: () => void
  maxWidth?: 'sm' | 'md' | 'lg'
}

export function Dialog({ open, title, children, actions, onClose, maxWidth = 'md' }: DialogProps) {
  return (
    <MuiDialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>{actions}</DialogActions>
    </MuiDialog>
  )
}
