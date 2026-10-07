import { useLocale } from '@/lib/i18n/LocaleContext'
import type { TranslationKey } from '@/lib/i18n/messages'
import type { ClientProfileTab, ClientProfileTabsProps } from './ClientProfileTabs.types'
export type { ClientProfileTab, ClientProfileTabsProps } from './ClientProfileTabs.types'

const tabs: { value: ClientProfileTab; labelKey: TranslationKey }[] = [
  { value: 'profile', labelKey: 'clientTabProfile' },
  { value: 'history', labelKey: 'clientTabHistory' },
]

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
