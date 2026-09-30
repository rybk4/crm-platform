import { formatDayMonth } from '@/lib/format/datetime'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { statusMeta } from '@/modules/journal/model'
import { ActionMenu } from '@/ui/ActionMenu'
import { Avatar } from '@/ui/Avatar'
import { Surface } from '@/ui/Surface'
import { clientBadge, clientInitials, clientServiceChips, recentVisitsByDate } from '../model'
import type { Client } from '../types'

interface ClientCardProps {
  client: Client
  onOpen: (client: Client) => void
  onDelete: (client: Client) => void
}

export function ClientCard({ client, onOpen, onDelete }: ClientCardProps) {
  const { locale, t } = useLocale()
  const badge = clientBadge(client)
  const services = clientServiceChips(client)
  const visits = recentVisitsByDate(client)

  return (
    <Surface className="client-card">
      <div className="client-card__header">
        <button className="client-card__person" type="button" onClick={() => onOpen(client)}>
          <Avatar
            className="client-card__avatar"
            label={client.name}
            value={clientInitials(client)}
          />
          <span className="client-card__identity">
            <strong title={client.name}>{client.name || t('clientNoName')}</strong>
            <small>{client.phone_number}</small>
          </span>
        </button>

        <div className="client-card__actions">
          {badge ? (
            <span className="client-card__badge" data-tone={badge.tone}>
              {t(badge.labelKey)}
            </span>
          ) : null}
          <ActionMenu
            label={t('actionsMenu')}
            items={[
              { key: 'edit', label: t('edit'), icon: 'edit', onSelect: () => onOpen(client) },
              {
                key: 'delete',
                label: t('delete'),
                icon: 'trash',
                danger: true,
                onSelect: () => onDelete(client),
              },
            ]}
          />
        </div>
      </div>

      {services.visible.length ? (
        <div className="client-card__services">
          {services.visible.map((name) => (
            <span key={name} title={name}>
              {name}
            </span>
          ))}
          {services.hidden.length ? (
            <span data-more title={services.hidden.join(', ')}>
              +{services.hidden.length}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="client-card__visits">
        <span>{t('clientRecentVisits')}</span>
        <div className="client-card__visit-list">
          {visits.length ? (
            visits.map((visit) => (
              <span
                key={visit.id}
                data-tone={statusMeta[visit.status].tone}
                title={`${visit.service_name} (${t(statusMeta[visit.status].labelKey)})`}
              >
                {formatDayMonth(visit.starts_at, locale)}
              </span>
            ))
          ) : (
            <span className="client-card__no-visits">{t('clientNoVisits')}</span>
          )}
        </div>
      </div>
    </Surface>
  )
}
