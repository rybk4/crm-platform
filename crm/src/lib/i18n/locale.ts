export const supportedLocales = ['ru', 'en', 'kk'] as const

export type Locale = (typeof supportedLocales)[number]

export const DEFAULT_LOCALE: Locale = 'ru'
export const LOCALE_STORAGE_KEY = 'crm.locale.v1'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && supportedLocales.some((locale) => locale === value)
}

export function readLocale(): Locale {
  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE
}

export function writeLocale(locale: Locale) {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}
