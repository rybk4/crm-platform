import { createContext, useContext } from 'react'

import type { Locale } from './locale'
import type { TranslationKey } from './messages'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, parameters?: Record<string, string | number>) => string
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) throw new Error('useLocale must be used inside LocaleProvider')
  return context
}
