import type { AppointmentDialogProps } from './AppointmentDialog.types'
export interface AppointmentFieldsProps extends Pick<
  AppointmentDialogProps,
  'dialog' | 'specialists' | 'services' | 'clients'
> {}
