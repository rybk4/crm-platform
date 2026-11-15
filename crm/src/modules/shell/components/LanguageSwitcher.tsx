import { useLocale } from '@/lib/i18n/LocaleContext'
import { supportedLocales } from '@/lib/i18n/locale'
import type { LanguageSwitcherProps } from './LanguageSwitcher.types'
export type { LanguageSwitcherProps } from './LanguageSwitcher.types'

const localeLabelKeys = {
  ru: 'languageRussian',
  en: 'languageEnglish',
  kk: 'languageKazakh',
} as const

export function LanguageSwitcher({ disabled, onSelect }: LanguageSwitcherProps) {
  const { locale, t } = useLocale()

  return (
    <fieldset className="language-switcher" disabled={disabled}>
      <legend>{t('interfaceLanguage')}</legend>
      <div className="language-switcher__track">
        {supportedLocales.map((item) => (
          <label key={item} className="language-option" data-selected={locale === item}>
            <input
              type="radio"
              name="interface-language"
              value={item}
              checked={locale === item}
              onChange={() => onSelect(item)}
            />
            <span lang={item}>{t(localeLabelKeys[item])}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
