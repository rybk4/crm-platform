import { sameEntityId } from '@/lib/api/entityId'
import { useLocale } from '@/lib/i18n/LocaleContext'

import { Button } from '@/ui/Button'
import { SidePanel } from '@/ui/SidePanel'
import { formatMoney } from '@/lib/format/money'
import { AppointmentFields } from './AppointmentFields'
import { AppointmentPayment } from './AppointmentPayment'
import { VisitSummary } from './VisitSummary'
import { Icon } from '@/ui/Icon'
import { statusMeta } from '../model'
import type { Appointment } from '../types'
import type { AppointmentDialogProps } from './AppointmentDialog.types'
export type { AppointmentDialogProps } from './AppointmentDialog.types'

import './visit-summary.css'

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
  const selectedService = services.find((service) => sameEntityId(service.id, dialog.form.service))

  return (
    <>
      <SidePanel
        floating
        open={dialog.open && !dialog.paymentOpen}
        title={
          dialog.editing?.deal_status === 'paid'
            ? t('journalCompletedVisit')
            : dialog.editing
              ? t('editAppointment')
              : t('addAppointment')
        }
        tone={dialog.editing ? statusMeta[dialog.editing.status].tone : 'primary'}
        onClose={dialog.close}
        footer={
          <>
            {dialog.editing?.deal_status === 'paid' ? (
              <>
                <div className="visit-total">
                  <strong>{t('journalTotal')}</strong>
                  <strong>{formatMoney(dialog.editing.price, dialog.editing.currency)}</strong>
                </div>
                <Button fullWidth onClick={dialog.close}>
                  {t('close')}
                </Button>
              </>
            ) : (
              <>
                <div className="visit-total">
                  <strong>{t('journalTotal')}</strong>
                  <strong>
                    {selectedService
                      ? formatMoney(selectedService.price, selectedService.currency)
                      : '—'}
                  </strong>
                </div>
                {dialog.editing?.deal && dialog.form.status !== 'cancelled' ? (
                  <Button
                    fullWidth
                    className="appointment-form__pay"
                    kind="outline"
                    disabled={!dialog.canPay}
                    onClick={() => dialog.setPaymentOpen(true)}
                  >
                    {t('appointmentPay')}
                  </Button>
                ) : null}
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
            )}
          </>
        }
      >
        {dialog.editing?.deal_status === 'paid' ? (
          <VisitSummary appointment={dialog.editing} />
        ) : (
          <AppointmentFields
            dialog={dialog}
            specialists={specialists}
            services={services}
            clients={clients}
          />
        )}
      </SidePanel>
      <AppointmentPayment dialog={dialog} paymentMethods={paymentMethods} />
    </>
  )
}
