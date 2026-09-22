import { useLocale } from '../../../lib/i18n/LocaleContext'
import { ModulePage } from '../../../ui/ModulePage'

export function AnalyticsPage() {
  const { t } = useLocale()

  return (
    <ModulePage
      title={t('analyticsTitle')}
      description={t('analyticsDescription')}
      icon="analytics"
      emptyTitle={t('analyticsEmptyTitle')}
      emptyDescription={t('analyticsEmptyDescription')}
    />
  )
}
