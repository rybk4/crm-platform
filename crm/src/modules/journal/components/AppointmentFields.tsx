import { useLocale } from '@/lib/i18n/LocaleContext'
import { parseEntityId, sameEntityId } from '@/lib/api/entityId'
import { SelectField } from '@/ui/SelectField'
import { TextField } from '@/ui/TextField'
import { appointmentStatuses } from '../types'
import { statusMeta } from '../model'
import type { AppointmentStatus } from '../types'
import type { AppointmentFieldsProps } from './AppointmentFields.types'

export function AppointmentFields({
  dialog,
  specialists,
  services,
  clients,
}: AppointmentFieldsProps) {
  const { t } = useLocale()
  const available = services.filter(
    (service) =>
      (sameEntityId(service.specialist, dialog.form.specialist) ||
        service.specialists?.some((id) => sameEntityId(id, dialog.form.specialist))) &&
      service.is_active,
  )

  return (
    <div className="appointment-form">
      <SelectField
        id="appointment-specialist"
        label={t('specialist')}
        value={dialog.form.specialist ? String(dialog.form.specialist) : ''}
        required
        options={specialists.map((item) => ({
          value: String(item.id),
          label: item.full_name,
        }))}
        onChange={(value) => dialog.patchSpecialist(parseEntityId(value))}
      />

      <div className="appointment-form__row">
        <TextField
          id="appointment-day"
          name="appointment-day"
          label={t('journalDate')}
          type="date"
          value={dialog.day}
          required
          onChange={dialog.setDay}
        />
        <TextField
          id="appointment-time"
          name="appointment-time"
          label={t('appointmentStart')}
          type="time"
          value={dialog.time}
          required
          onChange={dialog.setTime}
        />
      </div>

      <SelectField
        id="appointment-client"
        label={t('appointmentClient')}
        value={dialog.form.client ? String(dialog.form.client) : ''}
        required
        options={clients.map((item) => ({
          value: String(item.id),
          label: `${item.name} · ${item.phone_number}`,
        }))}
        onChange={(value) => dialog.patch({ client: parseEntityId(value) })}
      />

      <SelectField
        id="appointment-service"
        label={t('appointmentService')}
        value={dialog.form.service ? String(dialog.form.service) : ''}
        required
        disabled={!available.length}
        options={available.map((item) => ({
          value: String(item.id),
          label: `${item.name} · ${t('minutesShort', { count: item.duration_minutes })}`,
        }))}
        onChange={(value) => dialog.patch({ service: parseEntityId(value) })}
      />

      <SelectField
        id="appointment-status"
        label={t('appointmentStatus')}
        value={dialog.form.status}
        options={appointmentStatuses.map((status) => ({
          value: status,
          label: t(statusMeta[status].labelKey),
        }))}
        onChange={(value) => dialog.patch({ status: value as AppointmentStatus })}
      />

      <TextField
        id="appointment-comment"
        name="appointment-comment"
        label={t('appointmentComment')}
        value={dialog.form.comment}
        multiline
        rows={2}
        onChange={(value) => dialog.patch({ comment: value })}
      />
    </div>
  )
}
