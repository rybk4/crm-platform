import { fromDayKey } from '@/lib/datetime/day'
import { dayKey } from '@/lib/datetime/day'
import { formatDayTitle } from '@/lib/format/datetime'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { dayWindow } from '../model'
import { JournalColumn } from './JournalColumn'
import { boardHeightPx, rulerMarks, offsetPx } from './boardLayout'
import { timeFromMinutes } from '@/lib/datetime/day'
import type { JournalWeekProps } from './JournalWeek.types'

export function JournalWeek({
  start,
  end,
  specialist,
  appointments,
  bounds,
  step = 30,
  onOpen,
  onCreate,
}: JournalWeekProps) {
  const { locale, t } = useLocale()
  const height = boardHeightPx(bounds, step)
  return (
    <div className="journal-board" role="group" aria-label={t('journalWeekView')}>
      <div className="journal-board__ruler">
        <div className="journal-board__ruler-head">{t('journalSchedule')}</div>
        <div className="journal-board__ruler-track" style={{ height }}>
          {rulerMarks(bounds, step).map((minute) => (
            <span
              key={minute}
              className="journal-board__mark"
              style={{ top: offsetPx(minute, bounds, step) }}
            >
              {timeFromMinutes(minute)}
            </span>
          ))}
        </div>
      </div>
      <div className="journal-board__columns">
        {Array.from(
          {
            length: end
              ? Math.round((fromDayKey(end).getTime() - start.getTime()) / 86400000) + 1
              : 7,
          },
          (_, offset) => {
            const date = new Date(start)
            date.setDate(start.getDate() + offset)
            return (
              <JournalColumn
                key={dayKey(date)}
                specialist={specialist}
                heading={formatDayTitle(date, locale)}
                window={dayWindow(specialist, date)}
                bounds={bounds}
                step={step}
                appointments={appointments.filter(
                  (a) => dayKey(new Date(a.starts_at)) === dayKey(date),
                )}
                height={height}
                onOpen={onOpen}
                onCreate={(id, time) => onCreate(id, time, dayKey(date))}
              />
            )
          },
        )}
      </div>
    </div>
  )
}
