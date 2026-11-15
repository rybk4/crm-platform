import { parseEntityId } from '@/lib/api/entityId'
import { fromDayKey } from '@/lib/datetime/day'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { IconButton } from '@/ui/IconButton'
import { SelectField } from '@/ui/SelectField'
import { JournalCalendar } from './JournalCalendar'
import type { JournalToolbarProps } from './JournalToolbar.types'

export function JournalToolbar({
  date,
  range,
  onRangeChange,
  specialists,
  specialist,
  step,
  onDateChange,
  onShift,
  onToday,
  onSpecialistChange,
  onFilter,
  onStepChange,
}: JournalToolbarProps) {
  const { locale, t } = useLocale()
  return (
    <div className="journal-toolbar">
      <div className="journal-toolbar__main">
        <div className="journal-toolbar__specialists">
          <SelectField
            id="journal-specialist"
            label={t('specialist')}
            hideLabel
            value={specialist === null ? '' : String(specialist)}
            options={[
              { value: '', label: t('allSpecialists') },
              ...specialists.map((item) => ({ value: String(item.id), label: item.full_name })),
            ]}
            onChange={(value) => onSpecialistChange(value ? parseEntityId(value) : null)}
          />
        </div>
        <div className="journal-toolbar__navigation">
          <IconButton ariaLabel={t('journalPreviousDay')} onClick={() => onShift(-1)}>
            <Icon name="chevron-left" />
          </IconButton>
          <time dateTime={date}>
            {range
              ? `${fromDayKey(range.from).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}–${fromDayKey(range.to).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}`
              : fromDayKey(date).toLocaleDateString(locale, {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
          </time>
          <IconButton ariaLabel={t('journalNextDay')} onClick={() => onShift(1)}>
            <Icon name="chevron-right" />
          </IconButton>
          <JournalCalendar
            date={date}
            range={range}
            rangeEnabled={specialist !== null}
            onDateChange={onDateChange}
            onRangeChange={onRangeChange}
          />
        </div>
        <Button className="journal-toolbar__secondary" kind="quiet" onClick={onToday}>
          {t('journalToday')}
        </Button>
      </div>
      <div className="journal-toolbar__aside">
        {specialist === null ? (
          <Button
            className="journal-toolbar__secondary"
            kind="quiet"
            startIcon={<Icon name="filter" />}
            onClick={onFilter}
          >
            {t('journalFilters')}
          </Button>
        ) : (
          <SelectField
            id="journal-interval"
            label={t('journalInterval')}
            hideLabel
            value={String(step)}
            options={[10, 15, 20, 25, 30, 60].map((value) => ({
              value: String(value),
              label: t('minutesShort', { count: value }),
            }))}
            onChange={(value) => onStepChange(Number(value))}
          />
        )}
      </div>
    </div>
  )
}
