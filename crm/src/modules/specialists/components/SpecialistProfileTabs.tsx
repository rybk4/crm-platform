import { useLocale } from '@/lib/i18n/LocaleContext'
import type { TranslationKey } from '@/lib/i18n/messages'
import type { SpecialistProfileTab } from '../hooks/useSpecialistProfile'
import { specialistProfileTabs } from '../hooks/useSpecialistProfile'

interface SpecialistProfileTabsProps {
  value: SpecialistProfileTab
  onChange: (value: SpecialistProfileTab) => void
}

const tabLabels: Record<SpecialistProfileTab, TranslationKey> = {
  about: 'specialistTabAbout',
  schedule: 'specialistTabSchedule',
  services: 'specialistTabServices',
  vacations: 'specialistTabVacations',
  payouts: 'specialistTabPayouts',
}

export function SpecialistProfileTabs({ value, onChange }: SpecialistProfileTabsProps) {
  const { t } = useLocale()

  return (
    <div className="specialist-tabs" role="tablist" aria-label={t('specialistProfileSections')}>
      {specialistProfileTabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={value === tab}
          data-selected={value === tab}
          onClick={() => onChange(tab)}
        >
          {t(tabLabels[tab])}
        </button>
      ))}
    </div>
  )
}
