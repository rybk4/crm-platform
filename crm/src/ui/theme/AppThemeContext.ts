import { createContext, useContext } from 'react'

import type { AppThemeDefinition, AppThemeId } from './themes'

export interface AppThemeContextValue {
  activeTheme: AppThemeDefinition
  themes: readonly AppThemeDefinition[]
  selectTheme: (id: AppThemeId) => void
}

export const AppThemeContext = createContext<AppThemeContextValue | null>(null)

export function useAppTheme() {
  const context = useContext(AppThemeContext)

  if (!context) {
    throw new Error('useAppTheme must be used inside UiProvider')
  }

  return context
}
