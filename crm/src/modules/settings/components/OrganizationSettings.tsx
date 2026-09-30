import type { FormEvent } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { TextField } from '@/ui/TextField'
import type { useOrganizationProfile } from '../hooks/useOrganizationProfile'
import { useSettingsForm } from '../hooks/useSettingsForm'
import type { City, OrganizationProfile } from '../types'
import { OrganizationMainFields } from './OrganizationMainFields'
import { OrganizationPhotos } from './OrganizationPhotos'

interface OrganizationSettingsProps {
  profile: OrganizationProfile
  cities: City[]
  update: ReturnType<typeof useOrganizationProfile>['update']
}

export function OrganizationSettings({ profile, cities, update }: OrganizationSettingsProps) {
  const { t } = useLocale()
  const settings = useSettingsForm({ profile, update })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void settings.submit()
  }

  return (
    <form className="organization-settings" noValidate onSubmit={handleSubmit}>
      <section className="organization-settings__section">
        <h2>{t('settingsMainInformation')}</h2>
        <OrganizationMainFields settings={settings} cities={cities} />
      </section>

      <section className="organization-settings__section">
        <h2>{t('settingsAdditionalInformation')}</h2>
        <TextField
          id="organization-description"
          name="description"
          label={t('settingsOrganizationDescription')}
          value={settings.form.description}
          onChange={(value) => settings.patch('description', value)}
          multiline
          rows={5}
        />
      </section>

      <section className="organization-settings__section">
        <h2>{t('settingsPhotos')}</h2>
        <p>{t('settingsPhotosHint')}</p>
        <OrganizationPhotos
          photos={settings.form.photo_urls}
          onAdd={settings.addPhotos}
          onRemove={settings.removePhoto}
        />
      </section>

      <div className="organization-settings__actions">
        <Button type="submit" fullWidth loading={settings.saving} disabled={!settings.dirty}>
          {settings.saving ? t('settingsSaving') : t('settingsSaveChanges')}
        </Button>
        <Button
          kind="danger"
          fullWidth
          disabled={!settings.dirty || settings.saving}
          onClick={settings.reset}
        >
          {t('settingsDiscardChanges')}
        </Button>
      </div>
    </form>
  )
}
