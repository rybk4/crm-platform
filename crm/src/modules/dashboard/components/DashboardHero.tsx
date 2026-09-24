import { formatDayTitle } from '@/lib/format/datetime'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { ActiveBranchDetails } from '@/modules/auth/types'
import { Icon } from '@/ui/Icon'
import { greetingKey } from '../model'

interface DashboardHeroProps {
  name: string
  now: Date
  activeBranch: ActiveBranchDetails | null
  elapsedPercent: number
}

export function DashboardHero({ name, now, activeBranch, elapsedPercent }: DashboardHeroProps) {
  const { locale, t } = useLocale()

  return (
    <header className="overview-hero">
      <div className="overview-hero__copy">
        <h1>{t(greetingKey(now.getHours()), { name })}</h1>
        <p>{t('overviewDescription')}</p>
      </div>

      <div className="overview-hero__meta">
        <span className="overview-hero__date">
          <Icon name="calendar" size={16} />
          {formatDayTitle(now, locale)}
        </span>
        {activeBranch ? <span className="overview-hero__branch">{activeBranch.name}</span> : null}
        <span
          className="overview-hero__progress"
          role="progressbar"
          aria-label={t('overviewDayLoad')}
          aria-valuenow={elapsedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${elapsedPercent}%` }} />
        </span>
      </div>
    </header>
  )
}
