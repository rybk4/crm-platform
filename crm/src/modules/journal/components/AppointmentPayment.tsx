import { parseEntityId } from '@/lib/api/entityId'
import { formatMoney } from '@/lib/format/money'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { SelectField } from '@/ui/SelectField'
import { SidePanel } from '@/ui/SidePanel'
import { TextField } from '@/ui/TextField'
import { VisitSummary } from './VisitSummary'
import type { AppointmentPaymentProps } from './AppointmentPayment.types'

export function AppointmentPayment({ dialog, paymentMethods }: AppointmentPaymentProps) {
  const { t } = useLocale()
  const appointment = dialog.editing
  if (!appointment) return null
  return (
    <SidePanel
      floating
      open={dialog.open && dialog.paymentOpen}
      title={t('appointmentPayment')}
      tone="success"
      onClose={() => dialog.setPaymentOpen(false)}
      footer={
        <>
          <div className="visit-total">
            <strong>{t('journalTotal')}</strong>
            <strong>
              {formatMoney(
                Math.max(0, Number(appointment.price) - Number(dialog.discount || 0)),
                appointment.currency,
              )}
            </strong>
          </div>
          <Button
            className="appointment-payment__submit"
            loading={dialog.paying}
            onClick={dialog.pay}
          >
            {t('journalCloseDeal')}
          </Button>
          <Button kind="quiet" onClick={() => dialog.setPaymentOpen(false)}>
            {t('cancel')}
          </Button>
        </>
      }
    >
      <div className="appointment-form">
        <VisitSummary appointment={appointment} />
        <SelectField
          id="appointment-payment-method"
          label={t('paymentMethodName')}
          value={dialog.paymentMethod ? String(dialog.paymentMethod) : ''}
          options={paymentMethods.map((item) => ({ value: String(item.id), label: item.name }))}
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
      </div>
    </SidePanel>
  )
}
