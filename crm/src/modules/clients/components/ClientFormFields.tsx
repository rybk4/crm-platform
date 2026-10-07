import { useLocale } from '@/lib/i18n/LocaleContext'
import { Checkbox } from '@/ui/Checkbox'
import { TextField } from '@/ui/TextField'
import type { ClientFormField } from '../model'
import { ClientStatusFields } from './ClientStatusFields'
import type { ClientFieldsProps } from './ClientFormFields.types'
export type { ClientFieldsProps } from './ClientFormFields.types'

/** Поля клиента в порядке ana-partners: личные данные, статус, заметка. */
export function ClientFormFields({ idPrefix, form, errors, patch }: ClientFieldsProps) {
  const { t } = useLocale()
  const error = (field: ClientFormField) => (errors[field] ? t(errors[field]) : undefined)

  return (
    <div className="client-form">
      <section className="client-form__section">
        <h2>{t('clientSectionClient')}</h2>
        <div className="client-form__columns">
          <div className="client-form__column">
            <TextField
              id={`${idPrefix}-last-name`}
              name="last_name"
              label={t('clientLastName')}
              value={form.last_name}
              onChange={(value) => patch('last_name', value)}
            />
            <TextField
              id={`${idPrefix}-first-name`}
              name="first_name"
              label={t('clientFirstName')}
              value={form.first_name}
              onChange={(value) => patch('first_name', value)}
              error={Boolean(errors.first_name)}
              helperText={error('first_name')}
              required
            />
            <TextField
              id={`${idPrefix}-middle-name`}
              name="middle_name"
              label={t('clientMiddleName')}
              value={form.middle_name}
              onChange={(value) => patch('middle_name', value)}
            />
          </div>
          <div className="client-form__column">
            <TextField
              id={`${idPrefix}-phone`}
              name="phone_number"
              type="tel"
              inputMode="tel"
              label={t('clientPhone')}
              value={form.phone_number}
              onChange={(value) => patch('phone_number', value)}
              error={Boolean(errors.phone_number)}
              helperText={error('phone_number')}
              required
            />
            <TextField
              id={`${idPrefix}-birthday`}
              name="birthday"
              type="date"
              label={t('clientBirthday')}
              value={form.birthday}
              onChange={(value) => patch('birthday', value)}
            />
            <div className="client-form__gender" role="group" aria-label={t('clientGender')}>
              <Checkbox
                label={t('clientGenderMale')}
                checked={form.gender === 'male'}
                onChange={(checked) => patch('gender', checked ? 'male' : '')}
              />
              <Checkbox
                label={t('clientGenderFemale')}
                checked={form.gender === 'female'}
                onChange={(checked) => patch('gender', checked ? 'female' : '')}
              />
            </div>
          </div>
        </div>
      </section>

      <ClientStatusFields idPrefix={idPrefix} form={form} errors={errors} patch={patch} />

      <section className="client-form__section">
        <h2>{t('clientSectionAdditional')}</h2>
        <TextField
          id={`${idPrefix}-note`}
          name="note"
          label={t('clientNote')}
          value={form.note}
          onChange={(value) => patch('note', value)}
          multiline
          rows={5}
        />
      </section>
    </div>
  )
}
