import MuiAlert from '@mui/material/Alert'
import type { ReactNode } from 'react'

interface AlertProps {
  children: ReactNode
  tone?: 'error' | 'info'
}

export function Alert({ children, tone = 'error' }: AlertProps) {
  return (
    <MuiAlert sx={{ whiteSpace: 'pre-line' }} severity={tone}>
      {children}
    </MuiAlert>
  )
}
