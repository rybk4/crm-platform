import { useLocale } from '@/lib/i18n/LocaleContext'
import { timeFromMinutes } from '@/lib/datetime/day'
import type { Specialist } from '@/modules/specialists/types'
import { Avatar } from '@/ui/Avatar'
import { specialistInitials } from '@/modules/specialists/model'
import { appointmentRange, type DayWindow } from '../model'
import type { Appointment } from '../types'
import { AppointmentCard } from './AppointmentCard'
import { heightPx, offsetPx, rulerMarks } from './boardLayout'

interface JournalColumnProps {
  specialist: Specialist
  window: DayWindow | null
  bounds: DayWindow
  appointments: readonly Appointment[]
  height: number
  onOpen: (appointment: Appointment) => void
  onCreate: (specialistId?: number, startTime?: string) => void
}

export function JournalColumn({
  specialist,
  window,
  bounds,
  appointments,
  height,
  onOpen,
  onCreate,
}: JournalColumnProps) {
  const { t } = useLocale()

  return (
    <div className="journal-column">
      <div className="journal-column__head">
        <Avatar
          className="journal-column__avatar"
          label={specialist.full_name}
          value={specialistInitials(specialist)}
          src={specialist.photo_url}
        />
        <div className="journal-column__identity">
          <strong>{specialist.full_name}</strong>
          <span>
            {window
              ? `${timeFromMinutes(window.open)}–${timeFromMinutes(window.close)}`
              : t('journalDayOffShort')}
          </span>
        </div>
      </div>

      <div className="journal-column__track" data-day-off={!window} style={{ height }}>
        <div className="journal-column__slots">
          {rulerMarks(bounds).map((minute) => {
            const inShift = Boolean(window && minute >= window.open && minute < window.close)
            const inBreak = Boolean(
              window &&
              window.breakStart !== null &&
              window.breakEnd !== null &&
              minute >= window.breakStart &&
              minute < window.breakEnd,
            )
            const available = inShift && !inBreak

            return (
              <button
                key={minute}
                className="journal-slot"
                type="button"
                data-available={available}
                disabled={!available}
                onClick={() => onCreate(specialist.id, timeFromMinutes(minute))}
              >
                <span className="journal-slot__idle">
                  {available ? t('journalAvailable') : t('journalUnavailable')}
                </span>
                <span className="journal-slot__add">+ {t('addAppointment')}</span>
              </button>
            )
          })}
        </div>

        {appointments.map((appointment) => {
          const range = appointmentRange(appointment)

          return (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              style={{
                top: offsetPx(range.start, bounds),
                height: heightPx(range.end - range.start),
              }}
              onOpen={onOpen}
            />
          )
        })}
      </div>
    </div>
  )
}
