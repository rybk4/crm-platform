import { useLocale } from '@/lib/i18n/LocaleContext'
import { SelectField } from '@/ui/SelectField'
import { TextField } from '@/ui/TextField'
import type { useSettingsForm } from '../hooks/useSettingsForm'
import type { City } from '../types'
import { OrganizationAvatarPicker } from './OrganizationAvatarPicker'

interface OrganizationMainFieldsProps {
  settings: ReturnType<typeof useSettingsForm>
  cities: City[]
}

export function OrganizationMainFields({ settings, cities }: OrganizationMainFieldsProps) {
  const { t } = useLocale()
  const { form, errors, patch } = settings
  const cityOptions = cities.map((city) => ({ value: String(city.id), label: city.name }))

  return (
    <div className="organization-settings__main">
      <OrganizationAvatarPicker
        url={form.avatar_url}
        name={form.name}
        onPick={settings.pickAvatar}
        onRemove={settings.removeAvatar}
      />

      <div className="organization-settings__column">
        <TextField
          id="organization-name"
          name="name"
          label={t('settingsOrganizationName')}
          value={form.name}
          onChange={(value) => patch('name', value)}
          error={Boolean(errors.name)}
          helperText={errors.name ? t(errors.name) : undefined}
          required
        />
        <TextField
          id="organization-email"
          name="email"
          type="email"
          label={t('settingsOrganizationEmail')}
          value={form.email}
          onChange={(value) => patch('email', value)}
          error={Boolean(errors.email)}
          helperText={errors.email ? t(errors.email) : undefined}
          autoComplete="email"
        />
        <TextField
          id="organization-address"
          name="address"
          label={t('settingsAddress')}
          value={form.address}
          onChange={(value) => patch('address', value)}
        />
      </div>

      <div className="organization-settings__column">
        <TextField
          id="organization-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          label={t('settingsOrganizationContacts')}
          value={form.phone}
          onChange={(value) => patch('phone', value)}
          error={Boolean(errors.phone)}
          helperText={errors.phone ? t(errors.phone) : undefined}
          required
        />
        <SelectField
          id="organization-city"
          label={t('settingsCity')}
          value={form.city}
          options={cityOptions}
          onChange={(value) => patch('city', value)}
        />
        <TextField
          id="organization-working-days"
          name="working_days"
          label={t('settingsWorkingDays')}
          value={form.working_days}
          onChange={(value) => patch('working_days', value)}
        />
      </div>
    </div>
  )
}
