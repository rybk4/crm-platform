import { fromDayKey } from '@/lib/datetime/day'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Popover } from '@/ui/Popover'
import { Icon } from '@/ui/Icon'
import { IconButton } from '@/ui/IconButton'
import { calendarDays } from '../calendarModel'
import { useJournalCalendar } from '../hooks/useJournalCalendar'
import type { JournalCalendarProps } from './JournalCalendar.types'
import './journal-calendar.css'

export function JournalCalendar({
  date,
  range,
  rangeEnabled,
  onDateChange,
  onRangeChange,
}: JournalCalendarProps) {
  const { locale, t } = useLocale()
  const calendar = useJournalCalendar(date, rangeEnabled, onDateChange, onRangeChange)
  return (
    <>
      <button
        type="button"
        className="journal-toolbar__calendar"
        aria-label={t('journalChooseDate')}
        onClick={(event) => calendar.open(event.currentTarget)}
      >
        <Icon name="calendar" />
      </button>
      <Popover anchor={calendar.anchor} onClose={calendar.close} label={t('journalChooseDate')}>
        <div className="journal-calendar">
          <h3>{t('journalChooseDate')}</h3>
          <div className="journal-calendar__heading">
            <IconButton ariaLabel={t('journalPreviousMonth')} onClick={() => calendar.move(-1)}>
              <Icon name="chevron-left" />
            </IconButton>
            <strong>
              {fromDayKey(calendar.month).toLocaleDateString(locale, {
                month: 'long',
                year: 'numeric',
              })}
            </strong>
            <IconButton ariaLabel={t('journalNextMonth')} onClick={() => calendar.move(1)}>
              <Icon name="chevron-right" />
            </IconButton>
          </div>
          <div className="journal-calendar__grid">
            {calendarDays(calendar.month)
              .slice(0, 7)
              .map((day) => (
                <small key={day}>
                  {fromDayKey(day).toLocaleDateString(locale, { weekday: 'short' })}
                </small>
              ))}
            {calendarDays(calendar.month).map((day) => (
              <button
                type="button"
                key={day}
                aria-label={fromDayKey(day).toLocaleDateString(locale, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                aria-pressed={
                  calendar.from === day ||
                  (!calendar.from && (range ? day >= range.from && day <= range.to : date === day))
                }
                data-outside={day.slice(0, 7) !== calendar.month.slice(0, 7)}
                onClick={() => calendar.select(day)}
              >
                {fromDayKey(day).getDate()}
              </button>
            ))}
          </div>
        </div>
      </Popover>
    </>
  )
}
