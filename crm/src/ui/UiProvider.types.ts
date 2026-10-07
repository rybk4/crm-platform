import type { CSSProperties, ReactNode } from 'react'

export type ThemeVariables = CSSProperties & Record<`--${string}`, string>

export interface UiProviderProps {
  children: ReactNode
}
