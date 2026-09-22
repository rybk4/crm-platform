import { useLocale } from '../../../lib/i18n/LocaleContext'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/Icon'
import { useAppTheme } from '../../../ui/theme/AppThemeContext'

export function ThemeStudio() {
  const { activeTheme, selectTheme, themes } = useAppTheme()
  const { t } = useLocale()

  return (
    <section className="theme-studio" aria-labelledby="theme-studio-title">
      <div className="theme-studio__intro">
        <div>
          <span className="theme-studio__eyebrow">{t('themeStudioEyebrow')}</span>
          <h2 id="theme-studio-title">{t(activeTheme.nameKey)}</h2>
          <p>{t(activeTheme.descriptionKey)}</p>
        </div>

        <div className="theme-studio__examples" aria-label={t('themeStudioExamples')}>
          <Button className="theme-studio__primary-action">{t('addAppointment')}</Button>
          <Button className="theme-studio__accent-action">{t('remindClient')}</Button>
          <span className="theme-studio__status">
            <span aria-hidden="true" />
            {t('appointmentConfirmed')}
          </span>
        </div>
      </div>

      <div className="theme-studio__themes" aria-label={t('themeOptions')}>
        {themes.map((theme, index) => {
          const selected = theme.id === activeTheme.id

          return (
            <button
              key={theme.id}
              className="theme-option"
              type="button"
              aria-label={t('themeOptionLabel', { number: index + 1, name: t(theme.nameKey) })}
              aria-pressed={selected}
              data-selected={selected}
              onClick={() => selectTheme(theme.id)}
            >
              <span className="theme-option__number">{String(index + 1).padStart(2, '0')}</span>
              <span className="theme-option__copy">
                <strong>{t(theme.shortNameKey)}</strong>
                <span className="theme-option__selected">
                  {selected ? (
                    <>
                      <Icon name="check" size={14} />
                      {t('selected')}
                    </>
                  ) : (
                    t('preview')
                  )}
                </span>
              </span>
              <span className="theme-option__swatches" aria-hidden="true">
                {theme.swatches.map((color) => (
                  <span key={color} style={{ backgroundColor: color }} />
                ))}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
