import MuiAlert from '@mui/material/Alert'
import type { AlertProps } from './Alert.types'
export type { AlertProps } from './Alert.types'

export function Alert({ children, tone = 'error' }: AlertProps) {
  return (
    <MuiAlert sx={{ whiteSpace: 'pre-line' }} severity={tone}>
      {children}
    </MuiAlert>
  )
}
