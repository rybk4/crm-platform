import { useState } from 'react'

import { formatCompactMoney } from '@/lib/format/money'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { ConfirmDialog } from '@/ui/ConfirmDialog'
import { EmptyState } from '@/ui/EmptyState'
import { Icon } from '@/ui/Icon'
import { Loader } from '@/ui/Loader'
import { PageHeader } from '@/ui/PageHeader'
import { StatTile } from '@/ui/StatTile'
import { useClientDialog } from '../hooks/useClientDialog'
import { useClients } from '../hooks/useClients'
import { clientTotals, filterClients } from '../model'
import type { Client, ClientSegment } from '../types'
import { ClientCard } from './ClientCard'
import { ClientDialog } from './ClientDialog'
import { ClientsToolbar } from './ClientsToolbar'
import { ClientProfile } from './ClientProfile'
import './clients.css'

export function ClientsPage() {
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState<ClientSegment | null>(null)
  const [selected, setSelected] = useState<Client | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null)
  const clients = useClients()
  const dialog = useClientDialog({ clients })

  const visible = filterClients(clients.clients, search, segment)
  const totals = clientTotals(clients.clients)
  const currency = clients.clients[0]?.currency ?? ''

  function handleEdit(client: Client) {
    setSelected(null)
    dialog.openEdit(client)
  }

  function handleDelete() {
    if (pendingDelete) clients.remove.mutate(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <section className="clients-page">
      <PageHeader
        title={t('clientsTitle')}
        description={t('clientsDescription')}
        actions={
          <Button startIcon={<Icon name="plus" />} onClick={dialog.openCreate}>
            {t('addClient')}
          </Button>
        }
      />

      <div className="clients-summary">
        <StatTile label={t('clientsTitle')} value={String(totals.clients)} icon="clients" />
        <StatTile label={t('clientVisits')} value={String(totals.visits)} icon="check-circle" />
        <StatTile
          label={t('clientSpent')}
          value={formatCompactMoney(totals.revenue, currency)}
          icon="wallet"
        />
      </div>

      <ClientsToolbar
        search={search}
        segment={segment}
        count={visible.length}
        onSearchChange={setSearch}
        onSegmentChange={setSegment}
      />

      {clients.isLoading ? <Loader label={t('loading')} /> : null}

      {!clients.isLoading && !clients.clients.length ? (
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

      {!clients.isLoading && clients.clients.length && !visible.length ? (
        <EmptyState
          icon="search"
          title={t('nothingFound')}
          description={t('nothingFoundDescription')}
        />
      ) : null}

      <div className="client-grid">
        {visible.map((client) => (
          <ClientCard key={client.id} client={client} onOpen={setSelected} />
        ))}
      </div>

      <ClientProfile
        client={selected}
        onClose={() => setSelected(null)}
        onEdit={handleEdit}
        onDelete={(client) => {
          setSelected(null)
          setPendingDelete(client)
        }}
      />

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
