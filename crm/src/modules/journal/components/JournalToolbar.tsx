import { formatDayTitle } from '@/lib/format/datetime'
import { fromDayKey } from '@/lib/datetime/day'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Specialist } from '@/modules/specialists/types'
import { Button } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { IconButton } from '@/ui/IconButton'
import { SegmentedControl } from '@/ui/SegmentedControl'
import { SelectField } from '@/ui/SelectField'
import { Toolbar } from '@/ui/Toolbar'
import { appointmentStatuses } from '../types'
import { statusMeta } from '../model'
import type { AppointmentStatus } from '../types'
import type { JournalView } from '../hooks/useJournalFilters'

interface JournalToolbarProps {
  date: string
  isToday: boolean
  specialists: readonly Specialist[]
  specialist: number | null
  status: AppointmentStatus | null
  view: JournalView
  onDateChange: (date: string) => void
  onShift: (days: number) => void
  onToday: () => void
  onSpecialistChange: (specialist: number | null) => void
  onStatusChange: (status: AppointmentStatus | null) => void
  onViewChange: (view: JournalView) => void
}

export function JournalToolbar({
  date,
  isToday,
  specialists,
  specialist,
  status,
  view,
  onDateChange,
  onShift,
  onToday,
  onSpecialistChange,
  onStatusChange,
  onViewChange,
}: JournalToolbarProps) {
  const { locale, t } = useLocale()

  return (
    <Toolbar className="journal-toolbar">
      <div className="journal-toolbar__date">
        <SelectField
          id="journal-specialist"
          label={t('specialist')}
          value={specialist ? String(specialist) : ''}
          options={[
            { value: '', label: t('allSpecialists') },
            ...specialists.map((item) => ({ value: String(item.id), label: item.full_name })),
          ]}
          onChange={(value) => onSpecialistChange(value ? Number(value) : null)}
        />

        <IconButton ariaLabel={t('journalPreviousDay')} onClick={() => onShift(-1)}>
          <Icon name="chevron-left" />
        </IconButton>

        <div className="journal-toolbar__day">
          <strong>{formatDayTitle(fromDayKey(date), locale)}</strong>
          <input
            className="journal-toolbar__input"
            type="date"
            value={date}
            aria-label={t('journalDate')}
            onChange={(event) => onDateChange(event.target.value)}
          />
        </div>

        <IconButton ariaLabel={t('journalNextDay')} onClick={() => onShift(1)}>
          <Icon name="chevron-right" />
        </IconButton>

        <Button kind="outline" disabled={isToday} onClick={onToday}>
          {t('journalToday')}
        </Button>
      </div>

      <div className="journal-toolbar__filters">
        <SelectField
          id="journal-status"
          label={t('journalStatusFilter')}
          value={status ?? ''}
          options={[
            { value: '', label: t('journalAllStatuses') },
            ...appointmentStatuses.map((item) => ({
              value: item,
              label: t(statusMeta[item].labelKey),
            })),
          ]}
          onChange={(value) => onStatusChange(value ? (value as AppointmentStatus) : null)}
        />

        <SegmentedControl
          ariaLabel={t('journalBoardView')}
          value={view}
          iconOnly
          options={[
            { value: 'board', label: t('journalBoardView'), icon: 'calendar' },
            { value: 'list', label: t('journalListView'), icon: 'list' },
          ]}
          onChange={(value) => onViewChange(value as JournalView)}
        />
      </div>
    </Toolbar>
  )
}
