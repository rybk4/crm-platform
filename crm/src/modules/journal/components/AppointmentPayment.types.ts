import type { AppointmentDialogProps } from './AppointmentDialog.types'
export interface AppointmentPaymentProps extends Pick<
  AppointmentDialogProps,
  'dialog' | 'paymentMethods'
> {}
