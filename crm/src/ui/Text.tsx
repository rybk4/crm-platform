import Typography from '@mui/material/Typography'
import type { HeadingProps, TextProps } from './Text.types'
export type { HeadingProps, TextProps } from './Text.types'

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
