import { formatDateTime } from '@/lib/format/datetime'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { useClients } from '@/modules/clients/hooks/useClients'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { EmptyState } from '@/ui/EmptyState'
import { Icon } from '@/ui/Icon'
import { Loader } from '@/ui/Loader'
import { PageHeader } from '@/ui/PageHeader'
import { useCampaignDialog } from '../hooks/useCampaignDialog'
import { useCampaigns } from '../hooks/useCampaigns'
import { CampaignDialog } from './CampaignDialog'
import './campaigns.css'
import '@/modules/finance/components/finance.css'

const campaignStatusKeys = {
  draft: 'campaignStatus_draft',
  queued: 'campaignStatus_queued',
  sent: 'campaignStatus_sent',
  failed: 'campaignStatus_failed',
} as const

export function CampaignsPage() {
  const { locale, t } = useLocale()
  const clients = useClients()
  const campaigns = useCampaigns()
  const dialog = useCampaignDialog(campaigns, clients.clients)
  return (
    <section className="business-page">
      <PageHeader
        title={t('campaignsTitle')}
        description={t('campaignsDescription')}
        actions={
          <Button startIcon={<Icon name="mail" />} onClick={dialog.show}>
            {t('createCampaign')}
          </Button>
        }
      />
      {campaigns.isLoading ? <Loader label={t('loading')} /> : null}
      {!campaigns.isLoading && !campaigns.campaigns.length ? (
        <EmptyState
          icon="mail"
          title={t('campaignEmpty')}
          description={t('campaignsDescription')}
        />
      ) : null}
      <div className="business-grid">
        {campaigns.campaigns.map((item) => (
          <Card key={item.id} title={item.title} hint={formatDateTime(item.created_at, locale)}>
            <p>{item.message}</p>
            <small>{t(campaignStatusKeys[item.status])}</small>
            <strong>{t('recipientsCount', { count: item.total_recipients })}</strong>
            <span>{t('deliveryRate', { rate: item.success_rate })}</span>
          </Card>
        ))}
      </div>
      <CampaignDialog
        dialog={dialog}
        clients={clients.clients}
        saving={campaigns.create.isPending}
      />
    </section>
  )
}
