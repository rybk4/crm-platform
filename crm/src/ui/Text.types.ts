import type { ReactNode } from 'react'

export interface HeadingProps {
  children: ReactNode
  level?: 1 | 2
  className?: string
}

export interface TextProps {
  children: ReactNode
  tone?: 'default' | 'muted'
  className?: string
}
