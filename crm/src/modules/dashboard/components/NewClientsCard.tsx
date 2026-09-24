import { Link } from 'react-router-dom'

import { formatShortDate } from '@/lib/format/datetime'
import { formatMoney } from '@/lib/format/money'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { clientInitials } from '@/modules/clients/model'
import type { Client } from '@/modules/clients/types'
import { Avatar } from '@/ui/Avatar'
import { Card } from '@/ui/Card'

interface NewClientsCardProps {
  clients: readonly Client[]
}

export function NewClientsCard({ clients }: NewClientsCardProps) {
  const { locale, t } = useLocale()

  return (
    <Card
      className="overview-card"
      title={t('overviewNewClients')}
      hint={t('overviewNewClientsHint')}
      actions={
        <Link className="overview-link" to="/clients">
          {t('overviewOpenClients')}
        </Link>
      }
    >
      {clients.length ? (
        <ul className="new-clients">
          {clients.map((client) => (
            <li key={client.id}>
              <Avatar
                className="new-clients__avatar"
                label={client.name}
                value={clientInitials(client)}
              />
              <span className="new-clients__identity">
                <strong>{client.name}</strong>
                <span>{t('overviewVisitsShort', { count: client.visits_count })}</span>
              </span>
              <span className="new-clients__meta">
                <strong>{formatMoney(client.total_spent, client.currency)}</strong>
                <small>
                  {client.first_visit_at ? formatShortDate(client.first_visit_at, locale) : '—'}
                </small>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="overview-empty">{t('overviewNoNewClients')}</p>
      )}
    </Card>
  )
}
