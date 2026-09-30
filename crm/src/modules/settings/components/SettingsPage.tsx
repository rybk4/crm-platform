import { useLocale } from '@/lib/i18n/LocaleContext'
import { ErrorState } from '@/ui/ErrorState'
import { Loader } from '@/ui/Loader'
import { PageHeader } from '@/ui/PageHeader'
import { useOrganizationProfile } from '../hooks/useOrganizationProfile'
import { OrganizationSettings } from './OrganizationSettings'
import './settings.css'

export function SettingsPage() {
  const { t } = useLocale()
  const organization = useOrganizationProfile()

  return (
    <section className="settings-page">
      <PageHeader title={t('settingsTitle')} description={t('settingsDescription')} />

      <div className="settings-tabs" role="tablist" aria-label={t('settingsSections')}>
        <button type="button" role="tab" aria-selected data-selected>
          {t('settingsTabOrganization')}
        </button>
      </div>

      <div className="settings-panel" role="tabpanel">
        {organization.isLoading ? <Loader label={t('loading')} /> : null}
        {organization.isError ? (
          <ErrorState
            title={t('settingsLoadError')}
            description={t('settingsLoadErrorDescription')}
            actionLabel={t('settingsRetry')}
            onAction={() => void organization.retry()}
          />
        ) : null}
        {organization.profile ? (
          <OrganizationSettings
            profile={organization.profile}
            cities={organization.cities}
            update={organization.update}
          />
        ) : null}
      </div>
    </section>
  )
}
