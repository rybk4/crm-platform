import { useLocale } from '@/lib/i18n/LocaleContext'
import { SelectField } from '@/ui/SelectField'
import { TextField } from '@/ui/TextField'
import type { ClientFormField } from '../model'
import { statusLabelKeys } from '../model'
import { clientStatuses } from '../types'
import type { ClientStatus } from '../types'
import type { ClientFieldsProps } from './ClientFormFields'

export function ClientStatusFields({ idPrefix, form, errors, patch }: ClientFieldsProps) {
  const { t } = useLocale()
  const error = (field: ClientFormField) => (errors[field] ? t(errors[field]) : undefined)

  return (
    <section className="client-form__section">
      <h2>{t('clientSectionStatus')}</h2>
      <div className="client-form__columns">
        <div className="client-form__column">
          <SelectField
            id={`${idPrefix}-status`}
            label={t('clientStatus')}
            value={form.status}
            options={clientStatuses.map((status) => ({
              value: status,
              label: t(statusLabelKeys[status]),
            }))}
            onChange={(value) => patch('status', value as ClientStatus)}
          />
          <TextField
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            label={t('clientEmail')}
            value={form.email}
            onChange={(value) => patch('email', value)}
            error={Boolean(errors.email)}
            helperText={error('email')}
          />
        </div>
        <div className="client-form__column">
          <div className="client-form__pair">
            <TextField
              id={`${idPrefix}-height`}
              name="height_cm"
              inputMode="numeric"
              label={t('clientHeight')}
              value={form.height_cm}
              onChange={(value) => patch('height_cm', value)}
              error={Boolean(errors.height_cm)}
              helperText={error('height_cm')}
            />
            <TextField
              id={`${idPrefix}-weight`}
              name="weight_kg"
              inputMode="numeric"
              label={t('clientWeight')}
              value={form.weight_kg}
              onChange={(value) => patch('weight_kg', value)}
              error={Boolean(errors.weight_kg)}
              helperText={error('weight_kg')}
            />
          </div>
          <TextField
            id={`${idPrefix}-discount`}
            name="discount_percent"
            inputMode="numeric"
            label={t('clientDiscount')}
            placeholder="%"
            value={form.discount_percent}
            onChange={(value) => patch('discount_percent', value)}
            error={Boolean(errors.discount_percent)}
            helperText={error('discount_percent')}
          />
        </div>
      </div>
    </section>
  )
}
