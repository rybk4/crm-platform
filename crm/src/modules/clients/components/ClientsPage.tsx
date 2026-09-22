import { useLocale } from '@/lib/i18n/LocaleContext'
import { ModulePage } from '@/ui/ModulePage'

export function ClientsPage() {
  const { t } = useLocale()

  return (
    <ModulePage
      title={t('clientsTitle')}
      description={t('clientsDescription')}
      icon="clients"
      emptyTitle={t('clientsEmptyTitle')}
      emptyDescription={t('clientsEmptyDescription')}
    />
  )
}
