import { useLocale } from '@/lib/i18n/LocaleContext'
import { Avatar } from '@/ui/Avatar'
import { Button } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { clientInitials } from '../model'
import type { ClientProfileHeaderProps } from './ClientProfileHeader.types'
export type { ClientProfileHeaderProps } from './ClientProfileHeader.types'

export function ClientProfileHeader({ client, onBack }: ClientProfileHeaderProps) {
  const { t } = useLocale()

  return (
    <header className="client-detail__header">
      <Button kind="quiet" startIcon={<Icon name="chevron-left" />} onClick={onBack}>
        {t('backToClients')}
      </Button>
      <div className="client-detail__person">
        <Avatar
          className="client-detail__avatar"
          label={client.name}
          value={clientInitials(client)}
        />
        <div>
          <h1>{client.name || t('clientNoName')}</h1>
          <p>{client.phone_number}</p>
        </div>
      </div>
    </header>
  )
}
