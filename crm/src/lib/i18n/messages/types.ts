import type { ru } from './ru'

export type TranslationKey = keyof typeof ru

export type TranslationMessages = Record<TranslationKey, string>
