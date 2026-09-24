import { formatShortDate } from '@/lib/format/datetime'
import { formatMoney } from '@/lib/format/money'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Avatar } from '@/ui/Avatar'
import { StatusPill } from '@/ui/StatusPill'
import { Surface } from '@/ui/Surface'
import { clientInitials, segmentMeta } from '../model'
import type { Client } from '../types'

interface ClientCardProps {
  client: Client
  onOpen: (client: Client) => void
}

export function ClientCard({ client, onOpen }: ClientCardProps) {
  const { locale, t } = useLocale()
  const segment = segmentMeta[client.segment]

  return (
    <Surface className="client-card">
      <button className="client-card__button" type="button" onClick={() => onOpen(client)}>
        <Avatar
          className="client-card__avatar"
          label={client.name}
          value={clientInitials(client)}
        />

        <span className="client-card__identity">
          <strong>{client.name}</strong>
          <span>{client.phone_number}</span>
        </span>

        <StatusPill label={t(segment.labelKey)} tone={segment.tone} size="sm" />

        <span className="client-card__stats">
          <span>
            <small>{t('clientVisits')}</small>
            <strong>{client.visits_count}</strong>
          </span>
          <span>
            <small>{t('clientSpent')}</small>
            <strong>{formatMoney(client.total_spent, client.currency)}</strong>
          </span>
          <span>
            <small>{t('clientLastVisit')}</small>
            <strong>
              {client.last_visit_at
                ? formatShortDate(client.last_visit_at, locale)
                : t('clientNeverVisited')}
            </strong>
          </span>
        </span>

        {client.note ? <span className="client-card__note">{client.note}</span> : null}
      </button>
    </Surface>
  )
}
