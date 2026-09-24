import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { Dialog } from '@/ui/Dialog'
import { TextField } from '@/ui/TextField'
import type { useClientDialog } from '../hooks/useClientDialog'

interface ClientDialogProps {
  dialog: ReturnType<typeof useClientDialog>
  saving: boolean
}

export function ClientDialog({ dialog, saving }: ClientDialogProps) {
  const { t } = useLocale()

  return (
    <Dialog
      open={dialog.open}
      title={dialog.editing ? t('editClient') : t('addClient')}
      maxWidth="sm"
      onClose={dialog.close}
      actions={
        <>
          <Button kind="quiet" onClick={dialog.close}>
            {t('cancel')}
          </Button>
          <Button loading={saving} onClick={dialog.submit}>
            {t('save')}
          </Button>
        </>
      }
    >
      <div className="client-form">
        <TextField
          id="client-name"
          name="client-name"
          label={t('clientName')}
          value={dialog.form.name}
          required
          autoFocus
          onChange={(value) => dialog.patch({ name: value })}
        />

        <div className="client-form__row">
          <TextField
            id="client-phone"
            name="client-phone"
            label={t('clientPhone')}
            type="tel"
            inputMode="tel"
            value={dialog.form.phone_number}
            required
            onChange={(value) => dialog.patch({ phone_number: value })}
          />
          <TextField
            id="client-birthday"
            name="client-birthday"
            label={t('clientBirthday')}
            type="date"
            value={dialog.form.birthday ?? ''}
            onChange={(value) => dialog.patch({ birthday: value || null })}
          />
        </div>

        <TextField
          id="client-email"
          name="client-email"
          label={t('clientEmail')}
          type="email"
          value={dialog.form.email}
          onChange={(value) => dialog.patch({ email: value })}
        />

        <TextField
          id="client-note"
          name="client-note"
          label={t('clientNote')}
          value={dialog.form.note}
          multiline
          rows={3}
          onChange={(value) => dialog.patch({ note: value })}
        />
      </div>
    </Dialog>
  )
}
