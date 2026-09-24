import type { Locale } from '@/lib/i18n/locale'

const localeTags: Record<Locale, string> = { ru: 'ru-RU', en: 'en-US', kk: 'kk-KZ' }

function tag(locale: Locale) {
  return localeTags[locale]
}

export function formatTime(value: string | Date, locale: Locale) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(tag(locale), { hour: '2-digit', minute: '2-digit' }).format(date)
}

/** «24 сентября, среда» — заголовок дня в журнале. */
export function formatDayTitle(value: Date, locale: Locale) {
  return new Intl.DateTimeFormat(tag(locale), {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(value)
}

export function formatShortDate(value: string | Date, locale: Locale) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(tag(locale), { day: 'numeric', month: 'short' }).format(date)
}

export function formatDateTime(value: string | Date, locale: Locale) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(tag(locale), {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatFullDate(value: string | Date, locale: Locale) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(tag(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
