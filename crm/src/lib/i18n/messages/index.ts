import type { Locale } from '../locale'
import { en } from './en'
import { kk } from './kk'
import { ru } from './ru'
import type { TranslationKey, TranslationMessages } from './types'

export type { TranslationKey, TranslationMessages }

export const messages: Record<Locale, TranslationMessages> = { ru, en, kk }

export function translate(
  locale: Locale,
  key: TranslationKey,
  parameters?: Record<string, string | number>,
) {
  const template = messages[locale][key]
  if (!parameters) return template

  return Object.entries(parameters).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  )
}
