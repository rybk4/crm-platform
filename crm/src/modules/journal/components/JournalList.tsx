import { formatTime } from '@/lib/format/datetime'
import { formatMoney } from '@/lib/format/money'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Icon } from '@/ui/Icon'
import { StatusPill } from '@/ui/StatusPill'
import { Surface } from '@/ui/Surface'
import { sourceLabelKeys, statusMeta } from '../model'
import type { Appointment } from '../types'

interface JournalListProps {
  appointments: readonly Appointment[]
  onOpen: (appointment: Appointment) => void
}

export function JournalList({ appointments, onOpen }: JournalListProps) {
  const { locale, t } = useLocale()

  return (
    <div className="journal-list">
      {appointments.map((appointment) => {
        const meta = statusMeta[appointment.status]

        return (
          <Surface key={appointment.id} className="journal-list__row">
            <div className="journal-list__time">
              <strong>{formatTime(appointment.starts_at, locale)}</strong>
              <small>{formatTime(appointment.ends_at, locale)}</small>
            </div>

            <div className="journal-list__client">
              <strong>{appointment.client_name}</strong>
              <span>{appointment.client_phone}</span>
            </div>

            <div className="journal-list__service">
              <strong>{appointment.service_name}</strong>
              <span>{appointment.specialist_name}</span>
            </div>

            <div className="journal-list__price">
              <strong>{formatMoney(appointment.price, appointment.currency)}</strong>
              <small>{t(sourceLabelKeys[appointment.source])}</small>
            </div>

            <StatusPill label={t(meta.labelKey)} tone={meta.tone} icon={meta.icon} />

            <button
              className="journal-list__open"
              type="button"
              aria-label={t('editAppointment')}
              title={t('editAppointment')}
              onClick={() => onOpen(appointment)}
            >
              <Icon name="chevron-right" />
            </button>
          </Surface>
        )
      })}
    </div>
  )
}
