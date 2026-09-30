import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { ErrorState } from '@/ui/ErrorState'
import { Loader } from '@/ui/Loader'
import { useClient } from '../hooks/useClient'
import { useClients } from '../hooks/useClients'
import { ClientProfileHeader } from './ClientProfileHeader'
import { ClientProfilePanel } from './ClientProfilePanel'
import { ClientProfileTabs } from './ClientProfileTabs'
import type { ClientProfileTab } from './ClientProfileTabs'
import { ClientVisitHistoryPanel } from './ClientVisitHistoryPanel'
import './clients.css'
import './client-detail.css'

export function ClientDetailPage() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const clientId = Number(useParams().clientId)
  const client = useClient(clientId)
  const clients = useClients()
  const [tab, setTab] = useState<ClientProfileTab>('profile')
  const backToList = () => navigate('/clients')

  if (client.isPending) return <Loader label={t('loading')} />

  if (!client.data) {
    return (
      <ErrorState
        title={t('clientNotFound')}
        description={t('clientNotFoundDescription')}
        actionLabel={t('backToClients')}
        onAction={backToList}
      />
    )
  }

  return (
    <section className="client-detail">
      <ClientProfileHeader client={client.data} onBack={backToList} />
      <ClientProfileTabs value={tab} onChange={setTab} />

      <div className="client-detail__panel" role="tabpanel">
        {tab === 'profile' ? (
          <ClientProfilePanel
            key={client.data.id}
            client={client.data}
            clients={clients}
            onCancel={backToList}
          />
        ) : (
          <ClientVisitHistoryPanel clientId={client.data.id} />
        )}
      </div>
    </section>
  )
}
