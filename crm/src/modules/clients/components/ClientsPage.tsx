import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { useServices } from '@/modules/services/hooks/useServices'
import { Button } from '@/ui/Button'
import { ConfirmDialog } from '@/ui/ConfirmDialog'
import { EmptyState } from '@/ui/EmptyState'
import { Icon } from '@/ui/Icon'
import { Loader } from '@/ui/Loader'
import { Pagination } from '@/ui/Pagination'
import { useClientDialog } from '../hooks/useClientDialog'
import { useClientFilters } from '../hooks/useClientFilters'
import { useClients } from '../hooks/useClients'
import type { Client } from '../types'
import { ClientCard } from './ClientCard'
import { ClientDialog } from './ClientDialog'
import { ClientFilterPanel } from './ClientFilterPanel'
import { ClientsTools } from './ClientsTools'
import './clients.css'

export function ClientsPage() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null)
  const filters = useClientFilters()
  const clients = useClients(filters.query)
  const services = useServices().services
  const dialog = useClientDialog({ clients })
  const view = filters.view(clients.clients)
  const openProfile = (client: Client) => navigate(`/clients/${client.id}`)
  const filtered = Boolean(filters.search || filters.activeCount)

  function handleDelete() {
    if (pendingDelete) clients.remove.mutate(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <section className="clients-page">
      <header className="clients-page__header">
        <h1>{t('clientsTitle')}</h1>
        <span>
          {view.total === 1 ? t('clientsCountOne') : t('clientsCount', { count: view.total })}
        </span>
      </header>

      <ClientsTools filters={filters} onAdd={dialog.openCreate} />

      {clients.isLoading ? <Loader label={t('loading')} /> : null}

      {!clients.isLoading && !view.total && !filtered ? (
        <EmptyState
          icon="clients"
          title={t('clientsEmptyTitle')}
          description={t('clientsEmptyDescription')}
          action={
            <Button startIcon={<Icon name="plus" />} onClick={dialog.openCreate}>
              {t('addClient')}
            </Button>
          }
        />
      ) : null}

      {!clients.isLoading && !view.total && filtered ? (
        <EmptyState
          icon="search"
          title={t('nothingFound')}
          description={t('nothingFoundDescription')}
        />
      ) : null}

      <div className="client-grid">
        {view.items.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onOpen={openProfile}
            onDelete={setPendingDelete}
          />
        ))}
      </div>

      <Pagination
        ariaLabel={t('clientsPages')}
        page={view.page}
        pages={view.pages}
        onChange={filters.setPage}
      />

      <ClientFilterPanel filters={filters} services={services} />
      <ClientDialog dialog={dialog} saving={clients.saving} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t('clientDeleteTitle')}
        description={t('clientDeleteConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        loading={clients.remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}
