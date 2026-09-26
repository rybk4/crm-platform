import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { scheduleSummary, weekdayKeys } from '../model'
import type { WorkSchedule } from '../types'
import { ScheduleEditor } from './ScheduleEditor'

interface SpecialistSchedulePanelProps {
  schedule: WorkSchedule[]
  onChange: (weekday: number, changes: Partial<WorkSchedule>) => void
  onSave: () => void
}

export function SpecialistSchedulePanel({
  schedule,
  onChange,
  onSave,
}: SpecialistSchedulePanelProps) {
  const { t } = useLocale()
  const summary = scheduleSummary(schedule)

  return (
    <div className="specialist-panel-stack">
      <div className="specialist-summary-strip">
        <div>
          <span>{t('workingDays')}</span>
          <strong>{summary.workingDays}</strong>
        </div>
        <div>
          <span>{t('hoursPerWeek')}</span>
          <strong>{summary.weeklyHours}</strong>
        </div>
        <div>
          <span>{t('daysOffCount')}</span>
          <strong>{7 - summary.workingDays}</strong>
        </div>
      </div>

      <Card title={t('weeklySchedule')} hint={t('weeklyScheduleHint')}>
        <div className="specialist-week-preview">
          {schedule.map((day) => (
            <div key={day.weekday} data-working={!day.is_day_off}>
              <strong>{t(weekdayKeys[day.weekday])}</strong>
              <span>
                {day.is_day_off
                  ? t('dayOff')
                  : `${day.start_time?.slice(0, 5)}–${day.end_time?.slice(0, 5)}`}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title={t('scheduleSettings')} hint={t('scheduleDraftHint')}>
        <ScheduleEditor schedule={schedule} onChange={onChange} />
      </Card>

      <div className="specialist-panel-actions">
        <Button onClick={onSave}>{t('saveDraft')}</Button>
      </div>
    </div>
  )
}
