import { formatDateTime } from '@/lib/format/datetime'
import { formatMoney } from '@/lib/format/money'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { statusMeta } from '@/modules/journal/model'
import { Button } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { SidePanel } from '@/ui/SidePanel'
import { StatusPill } from '@/ui/StatusPill'
import { useClientVisits } from '../hooks/useClientVisits'
import { segmentMeta } from '../model'
import type { Client } from '../types'

interface ClientProfileProps {
  client: Client | null
  onClose: () => void
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

export function ClientProfile({ client, onClose, onEdit, onDelete }: ClientProfileProps) {
  const { locale, t } = useLocale()
  const visits = useClientVisits(client?.id ?? null)

  return (
    <SidePanel
      open={Boolean(client)}
      title={t('clientProfile')}
      closeLabel={t('close')}
      onClose={onClose}
      footer={
        client ? (
          <>
            <Button startIcon={<Icon name="edit" />} onClick={() => onEdit(client)}>
              {t('edit')}
            </Button>
            <Button
              kind="danger"
              startIcon={<Icon name="trash" />}
              onClick={() => onDelete(client)}
            >
              {t('delete')}
            </Button>
          </>
        ) : null
      }
    >
      {client ? (
        <div className="client-profile">
          <header className="client-profile__head">
            <h3>{client.name}</h3>
            <StatusPill
              label={t(segmentMeta[client.segment].labelKey)}
              tone={segmentMeta[client.segment].tone}
            />
          </header>

          <dl className="client-profile__facts">
            <div>
              <dt>{t('clientPhone')}</dt>
              <dd>{client.phone_number}</dd>
            </div>
            <div>
              <dt>{t('clientEmail')}</dt>
              <dd>{client.email || '—'}</dd>
            </div>
            <div>
              <dt>{t('clientVisits')}</dt>
              <dd>{client.visits_count}</dd>
            </div>
            <div>
              <dt>{t('clientAverageCheck')}</dt>
              <dd>{formatMoney(client.average_check, client.currency)}</dd>
            </div>
            <div>
              <dt>{t('clientSpent')}</dt>
              <dd>{formatMoney(client.total_spent, client.currency)}</dd>
            </div>
            <div>
              <dt>{t('clientBirthday')}</dt>
              <dd>{client.birthday ?? '—'}</dd>
            </div>
          </dl>

          {client.note ? <p className="client-profile__note">{client.note}</p> : null}

          <section className="client-profile__history">
            <h4>{t('clientHistory')}</h4>

            {visits.isPending ? <p className="client-profile__empty">{t('loading')}</p> : null}

            {!visits.isPending && !visits.data?.length ? (
              <p className="client-profile__empty">{t('clientHistoryEmpty')}</p>
            ) : null}

            <ul>
              {(visits.data ?? []).map((visit) => (
                <li key={visit.id}>
                  <div>
                    <strong>{visit.service_name}</strong>
                    <span>{visit.specialist_name}</span>
                  </div>
                  <div className="client-profile__visit-meta">
                    <small>{formatDateTime(visit.starts_at, locale)}</small>
                    <strong>{formatMoney(visit.price, visit.currency)}</strong>
                  </div>
                  <StatusPill
                    label={t(statusMeta[visit.status].labelKey)}
                    tone={statusMeta[visit.status].tone}
                    size="sm"
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </SidePanel>
  )
}
