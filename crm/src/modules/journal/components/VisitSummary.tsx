import { formatMoney } from '@/lib/format/money'
import { formatDayTitle, formatTime } from '@/lib/format/datetime'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Avatar } from '@/ui/Avatar'
import type { VisitSummaryProps } from './VisitSummary.types'

export function VisitSummary({ appointment }: VisitSummaryProps) {
  const { locale, t } = useLocale()
  return (
    <div className="visit-summary">
      <div className="visit-summary__person">
        <Avatar
          label={appointment.specialist_name}
          value={appointment.specialist_name.slice(0, 1)}
        />
        <strong>{appointment.specialist_name}</strong>
      </div>
      <div className="visit-summary__date">
        <div>
          <small>{t('journalDate')}</small>
          <strong>{formatDayTitle(new Date(appointment.starts_at), locale)}</strong>
        </div>
        <div>
          <small>{t('appointmentStart')}</small>
          <strong>{formatTime(appointment.starts_at, locale)}</strong>
        </div>
      </div>
      <section>
        <h3>{t('appointmentClient')}</h3>
        <div className="visit-summary__person">
          <Avatar label={appointment.client_name} value={appointment.client_name.slice(0, 1)} />
          <div>
            <strong>{appointment.client_name}</strong>
            <small>{appointment.client_phone}</small>
          </div>
        </div>
      </section>
      <section>
        <h3>{t('appointmentService')}</h3>
        <div className="visit-summary__service">
          <div>
            <strong>{appointment.service_name}</strong>
            <small>
              {formatTime(appointment.starts_at, locale)} –{' '}
              {formatTime(appointment.ends_at, locale)}
            </small>
          </div>
          <strong>{formatMoney(appointment.price, appointment.currency)}</strong>
        </div>
      </section>
      {appointment.comment ? (
        <section>
          <h3>{t('appointmentComment')}</h3>
          <p>{appointment.comment}</p>
        </section>
      ) : null}
    </div>
  )
}
