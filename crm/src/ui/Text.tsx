import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

interface HeadingProps {
  children: ReactNode
  level?: 1 | 2
  className?: string
}

interface TextProps {
  children: ReactNode
  tone?: 'default' | 'muted'
  className?: string
}

export function Heading({ children, level = 1, className }: HeadingProps) {
  return (
    <Typography className={className} component={`h${level}`} variant={level === 1 ? 'h5' : 'h6'}>
      {children}
    </Typography>
  )
}

export function Text({ children, tone = 'default', className }: TextProps) {
  return (
    <Typography className={className} color={tone === 'muted' ? 'text.secondary' : 'text.primary'}>
      {children}
    </Typography>
  )
}

