import Paper from '@mui/material/Paper'
import type { SurfaceProps } from './Surface.types'
export type { SurfaceProps } from './Surface.types'

export function Surface({ children, className }: SurfaceProps) {
  return <Paper className={className}>{children}</Paper>
}
