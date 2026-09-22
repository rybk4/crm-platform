import Paper from '@mui/material/Paper'
import type { ReactNode } from 'react'

interface SurfaceProps {
  children: ReactNode
  className?: string
}

export function Surface({ children, className }: SurfaceProps) {
  return <Paper className={className}>{children}</Paper>
}
