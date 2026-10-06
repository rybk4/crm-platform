import { dayKey } from '@/lib/datetime/day'
import { formatDayTitle, formatTime } from '@/lib/format/datetime'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Surface } from '@/ui/Surface'
import type { Appointment } from '../types'

interface JournalWeekProps {
  start: Date
  appointments: readonly Appointment[]
  onOpen: (appointment: Appointment) => void
}

export function JournalWeek({ start, appointments, onOpen }: JournalWeekProps) {
  const { locale, t } = useLocale()

  return (
    <div className="journal-week">
      {Array.from({ length: 7 }, (_, offset) => {
        const date = new Date(start)
        date.setDate(start.getDate() + offset)
        const items = appointments.filter(
          (appointment) => dayKey(new Date(appointment.starts_at)) === dayKey(date),
        )

        return (
          <Surface className="journal-week__day" key={dayKey(date)}>
            <header>
              <strong>{formatDayTitle(date, locale)}</strong>
              <span>{t('appointmentsCount', { count: items.length })}</span>
            </header>
            <div className="journal-week__items">
              {items.map((appointment) => (
                <button type="button" key={appointment.id} onClick={() => onOpen(appointment)}>
                  <time>{formatTime(appointment.starts_at, locale)}</time>
                  <strong>{appointment.client_name}</strong>
                  <span>{appointment.service_name}</span>
                </button>
              ))}
              {!items.length ? <small>{t('journalEmptyTitle')}</small> : null}
            </div>
          </Surface>
        )
      })}
    </div>
  )
}
