import { useLocale } from '@/lib/i18n/LocaleContext'
import { Icon } from '@/ui/Icon'
import { useAppTheme } from '@/ui/theme/AppThemeContext'

export function ThemePicker() {
  const { activeTheme, selectTheme, themes } = useAppTheme()
  const { t } = useLocale()

  return (
    <fieldset className="profile-popover__themes">
      <legend>{t('themeOptions')}</legend>
      <div>
        {themes.map((theme, index) => {
          const selected = theme.id === activeTheme.id

          return (
            <button
              key={theme.id}
              type="button"
              aria-label={t('themeOptionLabel', { number: index + 1, name: t(theme.nameKey) })}
              aria-pressed={selected}
              data-selected={selected}
              title={t(theme.nameKey)}
              onClick={() => selectTheme(theme.id)}
            >
              <span className="theme-swatch" aria-hidden="true">
                {theme.swatches.map((color) => (
                  <span key={color} style={{ backgroundColor: color }} />
                ))}
              </span>
              <span className="theme-swatch__name">{t(theme.shortNameKey)}</span>
              {selected ? <Icon name="check" size={13} /> : null}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
