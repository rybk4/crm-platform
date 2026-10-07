import type { FormEvent } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { useClientProfileForm } from '../hooks/useClientProfileForm'

import { ClientFormFields } from './ClientFormFields'
import type { ClientProfilePanelProps } from './ClientProfilePanel.types'
export type { ClientProfilePanelProps } from './ClientProfilePanel.types'

export function ClientProfilePanel({ client, clients, onCancel }: ClientProfilePanelProps) {
  const { t } = useLocale()
  const profile = useClientProfileForm({ client, clients })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void profile.submit()
  }

  return (
    <form className="client-profile-form" noValidate onSubmit={handleSubmit}>
      <ClientFormFields
        idPrefix="client-profile"
        form={profile.form}
        errors={profile.errors}
        patch={profile.patch}
      />
      <div className="client-profile-form__actions">
        <Button type="submit" fullWidth loading={profile.saving} disabled={!profile.dirty}>
          {t('save')}
        </Button>
        <Button kind="danger" fullWidth disabled={profile.saving} onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  )
}
