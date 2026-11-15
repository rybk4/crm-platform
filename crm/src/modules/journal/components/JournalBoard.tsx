import { minutesOfDay, timeFromMinutes } from '@/lib/datetime/day'
import { useLocale } from '@/lib/i18n/LocaleContext'

import { dayWindow } from '../model'

import { Pagination } from '@/ui/Pagination'
import { useJournalPagination } from '../hooks/useJournalPagination'
import { JournalColumn } from './JournalColumn'
import { boardHeightPx, HEAD_PX, offsetPx, rulerMarks } from './boardLayout'
import type { JournalBoardProps } from './JournalBoard.types'
export type { JournalBoardProps } from './JournalBoard.types'

export function JournalBoard({
  step = 30,
  specialists,
  appointments,
  bounds,
  day,
  now,
  onOpen,
  onCreate,
}: JournalBoardProps) {
  const { t } = useLocale()
  const { elementRef, page, pages, setPage, from, to } = useJournalPagination(specialists.length)
  const height = boardHeightPx(bounds, step)
  const nowMinutes = now ? minutesOfDay(now) : null
  const showNow = nowMinutes !== null && nowMinutes >= bounds.open && nowMinutes <= bounds.close

  return (
    <div className="journal-schedule" ref={elementRef}>
      <div className="journal-board" role="group" aria-label={t('journalBoardLabel')}>
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
          {showNow ? (
            <span
              className="journal-board__now"
              role="separator"
              aria-label={t('journalCurrentTime')}
              style={{ top: HEAD_PX + offsetPx(nowMinutes, bounds, step) }}
            />
          ) : null}

          {specialists.slice(from, to).map((specialist) => (
            <JournalColumn
              step={step}
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
      <Pagination ariaLabel={t('journalStaffPages')} page={page} pages={pages} onChange={setPage} />
    </div>
  )
}
