import { useLocale } from '@/lib/i18n/LocaleContext'
import { Avatar } from '@/ui/Avatar'
import { Icon } from '@/ui/Icon'
import { IconButton } from '@/ui/IconButton'
import { Surface } from '@/ui/Surface'
import { scheduleDayLabel, specialistInitials, weekdayKeys } from '../model'
import type { Specialist } from '../types'

interface SpecialistRowProps {
  specialist: Specialist
  onEdit: (specialist: Specialist) => void
  onDelete: (specialist: Specialist) => void
}

export function SpecialistRow({ specialist, onEdit, onDelete }: SpecialistRowProps) {
  const { t } = useLocale()

  return (
    <Surface className="specialist-row">
      <Avatar
        className="specialist-row__avatar"
        label={specialist.full_name}
        value={specialistInitials(specialist)}
        src={specialist.photo_url}
      />

      <div className="specialist-row__identity">
        <strong>{specialist.full_name}</strong>
        <span>{specialist.job_title || specialist.branch_name}</span>
        {specialist.job_title ? <small>{specialist.branch_name}</small> : null}
      </div>

      <div className="specialist-row__contact">
        <span>{specialist.phone_number || '—'}</span>
        <small>{t('servicesCount', { count: specialist.services_count })}</small>
      </div>

      <div className="schedule-strip" aria-label={t('schedule')}>
        {weekdayKeys.map((key, weekday) => {
          const day = specialist.schedule.find((item) => item.weekday === weekday)
          return (
            <span
              key={key}
              data-working={day ? !day.is_day_off : false}
              title={(day && scheduleDayLabel(day)) ?? t('dayOff')}
            >
              {t(key)}
            </span>
          )
        })}
      </div>

      <span className="status-pill" data-active={specialist.is_active}>
        {specialist.is_active ? t('active') : t('inactive')}
      </span>

      <div className="management-actions">
        <IconButton ariaLabel={t('edit')} title={t('edit')} onClick={() => onEdit(specialist)}>
          <Icon name="edit" />
        </IconButton>
        <IconButton
          ariaLabel={t('delete')}
          title={t('delete')}
          onClick={() => onDelete(specialist)}
        >
          <Icon name="trash" />
        </IconButton>
      </div>
    </Surface>
  )
}
