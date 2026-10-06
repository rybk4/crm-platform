import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Client } from '@/modules/clients/types'
import { Button } from '@/ui/Button'
import { Checkbox } from '@/ui/Checkbox'
import { Dialog } from '@/ui/Dialog'
import { TextField } from '@/ui/TextField'
import type { useCampaignDialog } from '../hooks/useCampaignDialog'
import './campaigns.css'

interface CampaignDialogProps {
  dialog: ReturnType<typeof useCampaignDialog>
  clients: readonly Client[]
  saving: boolean
}
export function CampaignDialog({ dialog, clients, saving }: CampaignDialogProps) {
  const { t } = useLocale()
  const allSelected = clients.length > 0 && dialog.form.recipients.length === clients.length
  return (
    <Dialog
      open={dialog.open}
      title={t('createCampaign')}
      maxWidth="lg"
      onClose={dialog.close}
      actions={
        <>
          <Button kind="quiet" onClick={dialog.close}>
            {t('cancel')}
          </Button>
          <Button loading={saving} onClick={() => void dialog.send()}>
            {t('sendCampaign')}
          </Button>
        </>
      }
    >
      <div className="campaign-form">
        <div className="business-form">
          <TextField
            id="campaign-title"
            name="title"
            label={t('campaignTitle')}
            value={dialog.form.title}
            onChange={(title) => dialog.patch({ title })}
            required
          />
          <TextField
            id="campaign-message"
            name="message"
            label={t('campaignMessage')}
            value={dialog.form.message}
            onChange={(message) => dialog.patch({ message })}
            multiline
            rows={6}
            required
          />
        </div>
        <div className="campaign-recipients">
          <h3>{t('campaignRecipients')}</h3>
          <Checkbox
            label={t('selectAllClients')}
            checked={allSelected}
            onChange={dialog.selectAll}
          />
          <div className="campaign-recipients__list">
            {clients.map((client) => (
              <Checkbox
                key={client.id}
                label={`${client.name} · ${client.phone_number}`}
                checked={dialog.form.recipients.includes(client.phone_number)}
                onChange={(checked) => dialog.toggle(client.phone_number, checked)}
              />
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  )
}
