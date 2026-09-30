import { useLocale } from '@/lib/i18n/LocaleContext'
import type { TranslationKey } from '@/lib/i18n/messages'

export type ClientProfileTab = 'profile' | 'history'

const tabs: { value: ClientProfileTab; labelKey: TranslationKey }[] = [
  { value: 'profile', labelKey: 'clientTabProfile' },
  { value: 'history', labelKey: 'clientTabHistory' },
]

interface ClientProfileTabsProps {
  value: ClientProfileTab
  onChange: (value: ClientProfileTab) => void
}

export function ClientProfileTabs({ value, onChange }: ClientProfileTabsProps) {
  const { t } = useLocale()

  return (
    <div className="client-tabs" role="tablist" aria-label={t('clientProfileSections')}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          data-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
        >
          {t(tab.labelKey)}
        </button>
      ))}
    </div>
  )
}
