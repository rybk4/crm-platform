import { formatCompactMoney } from '@/lib/format/money'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { StatTile } from '@/ui/StatTile'
import type { DayTotals } from '../model'

interface JournalSummaryProps {
  totals: DayTotals
  availableMinutes: number
  currency: string
}

export function JournalSummary({ totals, availableMinutes, currency }: JournalSummaryProps) {
  const { t } = useLocale()
  const hours = Math.round((totals.bookedMinutes / 60) * 10) / 10
  const load =
    availableMinutes > 0 ? Math.round((totals.bookedMinutes / availableMinutes) * 100) : 0

  return (
    <div className="journal-summary">
      <StatTile
        label={t('journalDayAppointments')}
        value={String(totals.count)}
        icon="journal"
        hint={t('overviewCompletedToday', { count: totals.completed })}
      />
      <StatTile
        label={t('journalBookedHours')}
        value={t('analyticsHoursShort', { count: hours })}
        icon="clock"
      />
      <StatTile
        label={t('journalDayLoad')}
        value={t('analyticsPercent', { value: load })}
        icon="analytics"
      />
      <StatTile
        label={t('journalPlannedRevenue')}
        value={formatCompactMoney(totals.revenue, currency)}
        icon="wallet"
      />
    </div>
  )
}
