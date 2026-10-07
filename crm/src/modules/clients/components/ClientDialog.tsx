import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { Dialog } from '@/ui/Dialog'

import { ClientFormFields } from './ClientFormFields'
import type { ClientDialogProps } from './ClientDialog.types'
export type { ClientDialogProps } from './ClientDialog.types'

export function ClientDialog({ dialog, saving }: ClientDialogProps) {
  const { t } = useLocale()

  return (
    <Dialog
      open={dialog.open}
      title={t('addClient')}
      onClose={dialog.close}
      actions={
        <>
          <Button kind="danger" onClick={dialog.close}>
            {t('cancel')}
          </Button>
          <Button loading={saving} onClick={dialog.submit}>
            {t('save')}
          </Button>
        </>
      }
    >
      <ClientFormFields
        idPrefix="client-create"
        form={dialog.form}
        errors={dialog.errors}
        patch={dialog.patch}
      />
    </Dialog>
  )
}
