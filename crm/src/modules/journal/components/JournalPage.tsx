import { useLocale } from '@/lib/i18n/LocaleContext'
import { ModulePage } from '@/ui/ModulePage'

export function JournalPage() {
  const { t } = useLocale()

  return (
    <ModulePage
      title={t('journalTitle')}
      description={t('journalDescription')}
      icon="journal"
      emptyTitle={t('journalEmptyTitle')}
      emptyDescription={t('journalEmptyDescription')}
    />
  )
}
