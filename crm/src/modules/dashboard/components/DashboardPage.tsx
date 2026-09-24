import { useMemo } from 'react'

import { formatCompactMoney } from '@/lib/format/money'
import { formatPercent } from '@/lib/format/number'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { AuthUser } from '@/modules/auth/types'
import { StatTile } from '@/ui/StatTile'
import { useDashboard } from '../hooks/useDashboard'
import { DashboardHero } from './DashboardHero'
import { NewClientsCard } from './NewClientsCard'
import { TodayLoadCard } from './TodayLoadCard'
import { UpcomingCard } from './UpcomingCard'
import { WeekRevenueCard } from './WeekRevenueCard'
import './dashboard.css'

interface DashboardPageProps {
  user: AuthUser
}

export function DashboardPage({ user }: DashboardPageProps) {
  const { t } = useLocale()
  const now = useMemo(() => new Date(), [])
  const activeBranch = user.active_branch_details
  const overview = useDashboard({ activeBranch, now })

  const totalLoad = overview.load.length
    ? Math.round(
        (overview.load.reduce((sum, item) => sum + item.bookedMinutes, 0) /
          Math.max(
            overview.load.reduce((sum, item) => sum + item.availableMinutes, 0),
            1,
          )) *
          100,
      )
    : 0

  return (
    <section className="overview-page">
      <DashboardHero
        name={user.name.trim() || user.phone_number}
        now={now}
        activeBranch={activeBranch}
        elapsedPercent={overview.elapsedPercent}
      />

      <div className="overview-kpi">
        <StatTile
          label={t('overviewTodayAppointments')}
          value={String(overview.appointments.length)}
          icon="journal"
          hint={t('overviewCompletedToday', { count: overview.progress.completed })}
        />
        <StatTile
          label={t('overviewTodayRevenue')}
          value={formatCompactMoney(overview.progress.revenue, overview.currency)}
          icon="wallet"
          hint={t('overviewRemainingToday', { count: overview.progress.remaining })}
        />
        <StatTile
          label={t('overviewDayLoad')}
          value={formatPercent(totalLoad)}
          icon="analytics"
          hint={t('overviewTodayLoadHint')}
        />
        <StatTile
          label={t('overviewNewClientsWeek')}
          value={String(overview.newClientsThisWeek)}
          icon="clients"
          hint={t('overviewNewClientsHint')}
        />
      </div>

      <div className="overview-grid">
        <UpcomingCard appointments={overview.upcoming} now={now} />
        <TodayLoadCard items={overview.load} />
        <NewClientsCard clients={overview.newClients} />
        <WeekRevenueCard
          points={overview.summary?.revenue_by_day ?? []}
          currency={overview.currency}
        />
      </div>
    </section>
  )
}
