import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { Checkbox } from '@/ui/Checkbox'
import { Dialog } from '@/ui/Dialog'
import { TextField } from '@/ui/TextField'
import type { LoyaltyDialogProps } from './LoyaltyDialog.types'
export type { LoyaltyDialogProps } from './LoyaltyDialog.types'

export function LoyaltyDialog({ dialog, saving }: LoyaltyDialogProps) {
  const { t } = useLocale()
  const form = dialog.form
  return (
    <Dialog
      open={dialog.open}
      title={t('addLoyaltyProgram')}
      onClose={dialog.close}
      actions={
        <>
          <Button kind="quiet" onClick={dialog.close}>
            {t('cancel')}
          </Button>
          <Button loading={saving} onClick={() => void dialog.save()}>
            {t('save')}
          </Button>
        </>
      }
    >
      <div className="business-form">
        <TextField
          id="loyalty-name"
          name="name"
          label={t('programName')}
          value={form.name}
          onChange={(name) => dialog.patch({ name })}
          required
        />
        <TextField
          id="loyalty-price"
          name="price"
          label={t('programPrice')}
          type="number"
          value={form.price}
          onChange={(price) => dialog.patch({ price })}
        />
        {form.kind === 'bonus' ? (
          <TextField
            id="loyalty-reward"
            name="reward_percent"
            label={t('rewardPercent')}
            type="number"
            value={form.reward_percent}
            onChange={(reward_percent) => dialog.patch({ reward_percent })}
          />
        ) : null}
        {form.kind === 'certificate' ? (
          <TextField
            id="loyalty-balance"
            name="initial_balance"
            label={t('initialBalance')}
            type="number"
            value={form.initial_balance}
            onChange={(initial_balance) => dialog.patch({ initial_balance })}
          />
        ) : null}
        {form.kind === 'subscription' ? (
          <TextField
            id="loyalty-visits"
            name="visits_count"
            label={t('visitsCount')}
            type="number"
            value={String(form.visits_count ?? '')}
            onChange={(value) => dialog.patch({ visits_count: value ? Number(value) : null })}
          />
        ) : null}
        <TextField
          id="loyalty-validity"
          name="validity_days"
          label={t('validityDays')}
          type="number"
          value={String(form.validity_days ?? '')}
          onChange={(value) => dialog.patch({ validity_days: value ? Number(value) : null })}
        />
        <Checkbox
          label={t('active')}
          checked={form.is_active}
          onChange={(is_active) => dialog.patch({ is_active })}
        />
      </div>
    </Dialog>
  )
}
