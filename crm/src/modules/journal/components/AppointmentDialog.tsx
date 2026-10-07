import { useLocale } from '@/lib/i18n/LocaleContext'
import { parseEntityId, sameEntityId } from '@/lib/api/entityId'

import { Button } from '@/ui/Button'
import { Dialog } from '@/ui/Dialog'
import { Icon } from '@/ui/Icon'
import { SelectField } from '@/ui/SelectField'
import { TextField } from '@/ui/TextField'
import { statusMeta } from '../model'
import { appointmentStatuses } from '../types'
import type { Appointment, AppointmentStatus } from '../types'
import type { AppointmentDialogProps } from './AppointmentDialog.types'
export type { AppointmentDialogProps } from './AppointmentDialog.types'

export function AppointmentDialog({
  dialog,
  specialists,
  services,
  clients,
  paymentMethods,
  saving,
  onDelete,
}: AppointmentDialogProps) {
  const { t } = useLocale()
  const available = services.filter(
    (service) =>
      (sameEntityId(service.specialist, dialog.form.specialist) ||
        service.specialists?.some((id) => sameEntityId(id, dialog.form.specialist))) &&
      service.is_active,
  )

  return (
    <Dialog
      open={dialog.open}
      title={dialog.editing ? t('editAppointment') : t('addAppointment')}
      maxWidth="sm"
      onClose={dialog.close}
      actions={
        <>
          {dialog.editing ? (
            <Button
              className="appointment-form__delete"
              kind="quiet"
              startIcon={<Icon name="trash" />}
              onClick={() => onDelete(dialog.editing as Appointment)}
            >
              {t('delete')}
            </Button>
          ) : null}
          <Button kind="quiet" onClick={dialog.close}>
            {t('cancel')}
          </Button>
          <Button loading={saving} onClick={dialog.submit}>
            {t('save')}
          </Button>
        </>
      }
    >
      <div className="appointment-form">
        <SelectField
          id="appointment-specialist"
          label={t('specialist')}
          value={dialog.form.specialist ? String(dialog.form.specialist) : ''}
          required
          options={specialists.map((item) => ({ value: String(item.id), label: item.full_name }))}
          onChange={(value) => dialog.patchSpecialist(parseEntityId(value))}
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

        {dialog.editing?.deal ? (
          <div className="appointment-form__payment">
            <strong>{t('appointmentPayment')}</strong>
            {dialog.editing.deal_status === 'paid' ? (
              <span>{t('appointmentAlreadyPaid')}</span>
            ) : (
              <>
                <SelectField
                  id="appointment-payment-method"
                  label={t('paymentMethodName')}
                  value={dialog.paymentMethod ? String(dialog.paymentMethod) : ''}
                  options={paymentMethods.map((item) => ({
                    value: String(item.id),
                    label: item.name,
                  }))}
                  onChange={(value) => dialog.setPaymentMethod(parseEntityId(value))}
                />
                <TextField
                  id="appointment-discount"
                  name="appointment-discount"
                  label={t('appointmentDiscount')}
                  type="number"
                  value={dialog.discount}
                  onChange={dialog.setDiscount}
                />
                <Button kind="outline" loading={dialog.paying} onClick={dialog.pay}>
                  {t('appointmentPay')}
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </Dialog>
  )
}
