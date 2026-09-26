import { useLocale } from '@/lib/i18n/LocaleContext'
import { formatMoney } from '@/lib/format/money'
import type { Service } from '@/modules/services/types'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Checkbox } from '@/ui/Checkbox'

interface SpecialistServicesPanelProps {
  services: Service[]
  selectedIds: number[]
  onToggle: (serviceId: number, selected: boolean) => void
  onSave: () => void
}

export function SpecialistServicesPanel({
  services,
  selectedIds,
  onToggle,
  onSave,
}: SpecialistServicesPanelProps) {
  const { t } = useLocale()

  return (
    <div className="specialist-panel-stack">
      <Card title={t('serviceSelection')} hint={t('serviceSelectionHint')}>
        <div className="specialist-service-list">
          {services.map((service) => (
            <div key={service.id} data-selected={selectedIds.includes(service.id)}>
              <Checkbox
                label={service.name}
                checked={selectedIds.includes(service.id)}
                onChange={(selected) => onToggle(service.id, selected)}
              />
              <span>{service.description}</span>
              <strong>{formatMoney(service.price, service.currency)}</strong>
              <small>{t('minutesShort', { count: service.duration_minutes })}</small>
            </div>
          ))}
        </div>
      </Card>

      <div className="specialist-panel-actions">
        <span>{t('selectedServicesCount', { count: selectedIds.length })}</span>
        <Button onClick={onSave}>{t('saveDraft')}</Button>
      </div>
    </div>
  )
}
