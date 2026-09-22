import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Specialist } from '@/modules/specialists/types'
import { Button } from '@/ui/Button'
import { Checkbox } from '@/ui/Checkbox'
import { Dialog } from '@/ui/Dialog'
import { SelectField } from '@/ui/SelectField'
import { TextField } from '@/ui/TextField'
import type { useServiceDialog } from '../hooks/useServiceDialog'
import { supportedCurrencies } from '../model'

interface ServiceDialogProps {
  dialog: ReturnType<typeof useServiceDialog>
  specialists: Specialist[]
  saving: boolean
}

export function ServiceDialog({ dialog, specialists, saving }: ServiceDialogProps) {
  const { t } = useLocale()
  const { form, patch } = dialog

  return (
    <Dialog
      open={dialog.open}
      title={dialog.editing ? t('editService') : t('addService')}
      onClose={() => !saving && dialog.close()}
      actions={
        <>
          <Button kind="quiet" onClick={dialog.close}>
            {t('cancel')}
          </Button>
          <Button loading={saving} onClick={() => void dialog.submit()}>
            {t('save')}
          </Button>
        </>
      }
    >
      <div className="service-form">
        <SelectField
          id="service-specialist"
          label={t('specialist')}
          value={String(form.specialist || '')}
          options={specialists.map((item) => ({
            value: String(item.id),
            label: `${item.full_name} · ${item.branch_name}`,
          }))}
          onChange={(value) => patch({ specialist: Number(value) })}
          required
        />

        <TextField
          id="service-name"
          name="name"
          label={t('serviceName')}
          value={form.name}
          onChange={(value) => patch({ name: value })}
          required
        />

        <div className="form-grid form-grid--three">
          <TextField
            id="service-duration"
            name="duration_minutes"
            label={t('durationMinutes')}
            value={String(form.duration_minutes)}
            onChange={(value) => patch({ duration_minutes: Number(value) })}
            type="number"
            inputMode="numeric"
            required
          />
          <TextField
            id="service-price"
            name="price"
            label={t('price')}
            value={form.price}
            onChange={(value) => patch({ price: value })}
            type="number"
            inputMode="numeric"
            required
          />
          <SelectField
            id="service-currency"
            label={t('currency')}
            value={form.currency}
            options={supportedCurrencies.map((currency) => ({
              value: currency,
              label: currency,
            }))}
            onChange={(value) => patch({ currency: value })}
          />
        </div>

        <TextField
          id="service-description"
          name="description"
          label={t('serviceDescription')}
          value={form.description}
          onChange={(value) => patch({ description: value })}
          multiline
          rows={4}
        />

        <Checkbox
          label={t('active')}
          checked={form.is_active}
          onChange={(value) => patch({ is_active: value })}
        />
      </div>
    </Dialog>
  )
}
