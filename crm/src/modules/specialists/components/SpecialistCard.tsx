import { useState } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { Avatar } from '@/ui/Avatar'
import { Icon } from '@/ui/Icon'
import { IconButton } from '@/ui/IconButton'
import { Surface } from '@/ui/Surface'
import { scheduleSummary, specialistInitials, upcomingScheduleDays } from '../model'
import type { Specialist } from '../types'

interface SpecialistCardProps {
  specialist: Specialist
  onOpen: (specialist: Specialist) => void
  onEdit: (specialist: Specialist) => void
  onDelete: (specialist: Specialist) => void
}

export function SpecialistCard({ specialist, onOpen, onEdit, onDelete }: SpecialistCardProps) {
  const { t } = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)
  const summary = scheduleSummary(specialist.schedule)
  const previewDays = upcomingScheduleDays(specialist.schedule)

  return (
    <Surface className="specialist-card" data-inactive={!specialist.is_active}>
      <div className="specialist-card__header">
        <button
          className="specialist-card__person"
          type="button"
          onClick={() => onOpen(specialist)}
        >
          <Avatar
            className="specialist-card__avatar"
            label={specialist.full_name}
            value={specialistInitials(specialist)}
            src={specialist.photo_url}
          />
          <span className="specialist-card__identity">
            <strong>{specialist.full_name}</strong>
            <small>{specialist.phone_number || '—'}</small>
          </span>
        </button>

        <div className="specialist-card__actions">
          {!specialist.is_active ? (
            <span className="specialist-card__badge">{t('inactive')}</span>
          ) : null}
          <IconButton
            className="specialist-card__menu-trigger"
            ariaLabel={t('actionsMenu')}
            title={t('actionsMenu')}
            expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name="more" size={22} />
          </IconButton>
          {menuOpen ? (
            <div className="specialist-card__menu" role="menu">
              <button type="button" role="menuitem" onClick={() => onEdit(specialist)}>
                <Icon name="edit" size={17} />
                {t('edit')}
              </button>
              <button
                type="button"
                role="menuitem"
                data-danger
                onClick={() => onDelete(specialist)}
              >
                <Icon name="trash" size={17} />
                {t('delete')}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="specialist-card__professions">
        <span>{specialist.job_title || t('positionNotSet')}</span>
      </div>

      <div className="specialist-card__schedule">
        <span>
          {t('scheduleRatio', {
            working: summary.workingDays,
            daysOff: 7 - summary.workingDays,
          })}
        </span>
        <div className="specialist-card__days" aria-label={t('schedule')}>
          {previewDays.map((day) => (
            <button
              key={day.key}
              type="button"
              data-working={day.working}
              title={day.interval ?? t('dayOff')}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>
    </Surface>
  )
}
