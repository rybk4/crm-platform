import type { Client } from '@/modules/clients/types'
import type { PaymentMethod } from '@/modules/finance/types'
import type { Service } from '@/modules/services/types'
import type { Specialist } from '@/modules/specialists/types'
import type { Appointment } from '../types'
import type { useAppointmentDialog } from '../hooks/useAppointmentDialog'

export interface AppointmentDialogProps {
  dialog: ReturnType<typeof useAppointmentDialog>
  specialists: readonly Specialist[]
  services: readonly Service[]
  clients: readonly Client[]
  paymentMethods: readonly PaymentMethod[]
  saving: boolean
  onDelete: (appointment: Appointment) => void
}
