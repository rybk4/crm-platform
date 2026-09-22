import { useLocale } from '@/lib/i18n/LocaleContext'
import { Checkbox } from '@/ui/Checkbox'
import { TextField } from '@/ui/TextField'
import { weekdayKeys } from '../model'
import type { WorkSchedule } from '../types'

interface ScheduleEditorProps {
  schedule: WorkSchedule[]
  onChange: (weekday: number, changes: Partial<WorkSchedule>) => void
}

export function ScheduleEditor({ schedule, onChange }: ScheduleEditorProps) {
  const { t } = useLocale()

  return (
    <div className="schedule-editor">
      {schedule.map((day) => (
        <div className="schedule-editor__row" key={day.weekday}>
          <strong>{t(weekdayKeys[day.weekday])}</strong>

          <Checkbox
            label={day.is_day_off ? t('dayOff') : t('workingDay')}
            checked={!day.is_day_off}
            onChange={(working) =>
              onChange(day.weekday, {
                is_day_off: !working,
                start_time: working ? (day.start_time ?? '09:00') : null,
                end_time: working ? (day.end_time ?? '18:00') : null,
              })
            }
          />

          <TextField
            id={`start-${day.weekday}`}
            name={`start-${day.weekday}`}
            label={t('start')}
            value={day.start_time ?? ''}
            onChange={(value) => onChange(day.weekday, { start_time: value })}
            type="time"
            disabled={day.is_day_off}
          />

          <TextField
            id={`end-${day.weekday}`}
            name={`end-${day.weekday}`}
            label={t('end')}
            value={day.end_time ?? ''}
            onChange={(value) => onChange(day.weekday, { end_time: value })}
            type="time"
            disabled={day.is_day_off}
          />
        </div>
      ))}
    </div>
  )
}
