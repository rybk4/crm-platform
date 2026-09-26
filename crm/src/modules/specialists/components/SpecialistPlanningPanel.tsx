import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { SelectField } from '@/ui/SelectField'
import { TextField } from '@/ui/TextField'
import type { SpecialistProfileTab } from '../hooks/useSpecialistProfile'

interface SpecialistPlanningPanelProps {
  tab: Extract<SpecialistProfileTab, 'vacations' | 'payouts'>
  vacationStart: string
  vacationEnd: string
  payoutModel: string
  payoutValue: string
  onVacationStartChange: (value: string) => void
  onVacationEndChange: (value: string) => void
  onPayoutModelChange: (value: string) => void
  onPayoutValueChange: (value: string) => void
  onSave: () => void
}

export function SpecialistPlanningPanel({
  tab,
  vacationStart,
  vacationEnd,
  payoutModel,
  payoutValue,
  onVacationStartChange,
  onVacationEndChange,
  onPayoutModelChange,
  onPayoutValueChange,
  onSave,
}: SpecialistPlanningPanelProps) {
  const { t } = useLocale()

  if (tab === 'vacations') {
    return (
      <div className="specialist-panel-stack">
        <Card title={t('vacationPlanning')} hint={t('vacationPlanningHint')}>
          <div className="specialist-planning-form">
            <TextField
              id="vacation-start"
              name="vacation_start"
              label={t('vacationStart')}
              type="date"
              value={vacationStart}
              onChange={onVacationStartChange}
            />
            <TextField
              id="vacation-end"
              name="vacation_end"
              label={t('vacationEnd')}
              type="date"
              value={vacationEnd}
              onChange={onVacationEndChange}
            />
          </div>
          <p className="specialist-muted-copy">{t('vacationBackendHint')}</p>
        </Card>
        <div className="specialist-panel-actions">
          <Button onClick={onSave}>{t('saveDraft')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="specialist-panel-stack">
      <Card title={t('payoutSettings')} hint={t('payoutSettingsHint')}>
        <div className="specialist-planning-form">
          <SelectField
            id="payout-model"
            label={t('payoutModel')}
            value={payoutModel}
            options={[
              { value: 'percent', label: t('payoutPercent') },
              { value: 'fixed', label: t('payoutFixed') },
              { value: 'salary', label: t('payoutSalary') },
            ]}
            onChange={onPayoutModelChange}
          />
          <TextField
            id="payout-value"
            name="payout_value"
            label={payoutModel === 'percent' ? t('percentValue') : t('amountValue')}
            type="number"
            inputMode="numeric"
            value={payoutValue}
            onChange={onPayoutValueChange}
          />
        </div>
        <p className="specialist-muted-copy">{t('payoutBackendHint')}</p>
      </Card>
      <div className="specialist-panel-actions">
        <Button onClick={onSave}>{t('saveDraft')}</Button>
      </div>
    </div>
  )
}
