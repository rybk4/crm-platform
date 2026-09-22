import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { LocaleContext } from './LocaleContext'
import { readLocale, writeLocale, type Locale } from './locale'
import { translate } from './messages'

interface LocaleProviderProps {
  children: ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(readLocale)
  const setLocale = useCallback((nextLocale: Locale) => {
    writeLocale(nextLocale)
    setLocaleState(nextLocale)
  }, [])
  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: Parameters<typeof translate>[1], parameters?: Parameters<typeof translate>[2]) =>
        translate(locale, key, parameters),
    }),
    [locale, setLocale],
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>
}
