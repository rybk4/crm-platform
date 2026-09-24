import { useLocale } from '@/lib/i18n/LocaleContext'
import { Icon } from '@/ui/Icon'
import { IconButton } from '@/ui/IconButton'
import { RowActions } from '@/ui/RowActions'
import { StatusPill } from '@/ui/StatusPill'
import { Surface } from '@/ui/Surface'
import { formatPrice } from '../model'
import type { Service } from '../types'

interface ServiceRowProps {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
}

export function ServiceRow({ service, onEdit, onDelete }: ServiceRowProps) {
  const { t } = useLocale()

  return (
    <Surface className="service-row">
      <div className="service-row__name">
        <strong>{service.name}</strong>
        <span>{service.description || '—'}</span>
      </div>

      <div className="service-row__owner">
        <strong>{service.specialist_name}</strong>
        <span>{service.branch_name}</span>
      </div>

      <div className="service-row__metric">
        <small>{t('durationMinutes')}</small>
        <strong>{t('minutesShort', { count: service.duration_minutes })}</strong>
      </div>

      <div className="service-row__metric service-row__price">
        <small>{t('price')}</small>
        <strong>{formatPrice(service.price, service.currency)}</strong>
      </div>

      <StatusPill
        label={service.is_active ? t('active') : t('inactive')}
        tone={service.is_active ? 'success' : 'neutral'}
        icon={service.is_active ? 'check-circle' : 'ban'}
        size="sm"
      />

      <RowActions>
        <IconButton ariaLabel={t('edit')} title={t('edit')} onClick={() => onEdit(service)}>
          <Icon name="edit" />
        </IconButton>
        <IconButton ariaLabel={t('delete')} title={t('delete')} onClick={() => onDelete(service)}>
          <Icon name="trash" />
        </IconButton>
      </RowActions>
    </Surface>
  )
}
