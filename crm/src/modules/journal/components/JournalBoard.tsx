import { minutesOfDay, timeFromMinutes } from '@/lib/datetime/day'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Specialist } from '@/modules/specialists/types'
import { dayWindow, type DayWindow } from '../model'
import type { Appointment } from '../types'
import { JournalColumn } from './JournalColumn'
import { boardHeightPx, HEAD_PX, offsetPx, rulerMarks } from './boardLayout'

interface JournalBoardProps {
  specialists: readonly Specialist[]
  appointments: readonly Appointment[]
  bounds: DayWindow
  day: Date
  /** Метку «сейчас» рисуем только на сегодняшнем дне. */
  now: Date | null
  onOpen: (appointment: Appointment) => void
  onCreate: (specialistId?: number, startTime?: string) => void
}

export function JournalBoard({
  specialists,
  appointments,
  bounds,
  day,
  now,
  onOpen,
  onCreate,
}: JournalBoardProps) {
  const { t } = useLocale()
  const height = boardHeightPx(bounds)
  const nowMinutes = now ? minutesOfDay(now) : null
  const showNow = nowMinutes !== null && nowMinutes >= bounds.open && nowMinutes <= bounds.close

  return (
    <div className="journal-board" role="group" aria-label={t('journalBoardLabel')}>
      <div className="journal-board__ruler">
        <div className="journal-board__ruler-head">{t('journalSchedule')}</div>
        <div className="journal-board__ruler-track" style={{ height }}>
          {rulerMarks(bounds).map((minute) => (
            <span
              key={minute}
              className="journal-board__mark"
              style={{ top: offsetPx(minute, bounds) }}
            >
              {timeFromMinutes(minute)}
            </span>
          ))}
        </div>
      </div>

      <div className="journal-board__columns">
        {showNow ? (
          <span
            className="journal-board__now"
            role="separator"
            aria-label={t('journalCurrentTime')}
            style={{ top: HEAD_PX + offsetPx(nowMinutes, bounds) }}
          />
        ) : null}

        {specialists.map((specialist) => (
          <JournalColumn
            key={specialist.id}
            specialist={specialist}
            window={dayWindow(specialist, day)}
            bounds={bounds}
            appointments={appointments.filter((item) => item.specialist === specialist.id)}
            height={height}
            onOpen={onOpen}
            onCreate={onCreate}
          />
        ))}
      </div>
    </div>
  )
}
