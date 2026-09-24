import { Link } from 'react-router-dom'

import { isSameDay } from '@/lib/datetime/day'
import { formatTime } from '@/lib/format/datetime'
import { formatMoney } from '@/lib/format/money'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { statusMeta } from '@/modules/journal/model'
import type { Appointment } from '@/modules/journal/types'
import { Card } from '@/ui/Card'
import { StatusPill } from '@/ui/StatusPill'

interface UpcomingCardProps {
  appointments: readonly Appointment[]
  now: Date
}

export function UpcomingCard({ appointments, now }: UpcomingCardProps) {
  const { locale, t } = useLocale()

  return (
    <Card
      className="overview-card overview-card--wide"
      title={t('overviewUpcoming')}
      hint={t('overviewUpcomingHint')}
      actions={
        <Link className="overview-link" to="/journal">
          {t('overviewOpenJournal')}
        </Link>
      }
    >
      {appointments.length ? (
        <ul className="upcoming-list">
          {appointments.map((appointment) => {
            const meta = statusMeta[appointment.status]
            const isToday = isSameDay(new Date(appointment.starts_at), now)

            return (
              <li key={appointment.id} data-tomorrow={!isToday}>
                <span className="upcoming-list__time">
                  <strong>{formatTime(appointment.starts_at, locale)}</strong>
                  <small>
                    {isToday ? formatTime(appointment.ends_at, locale) : t('overviewTomorrowShort')}
                  </small>
                </span>

                <span className="upcoming-list__client">
                  <strong>{appointment.client_name}</strong>
                  <span>{appointment.service_name}</span>
                </span>

                <span className="upcoming-list__specialist">{appointment.specialist_name}</span>

                <span className="upcoming-list__price">
                  {formatMoney(appointment.price, appointment.currency)}
                </span>

                <StatusPill label={t(meta.labelKey)} tone={meta.tone} icon={meta.icon} size="sm" />
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="overview-empty">{t('overviewNoUpcoming')}</p>
      )}
    </Card>
  )
}
