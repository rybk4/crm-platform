import type { Locale } from '@/lib/i18n/locale'

export interface LanguageSwitcherProps {
  disabled: boolean
  onSelect: (locale: Locale) => void
}
