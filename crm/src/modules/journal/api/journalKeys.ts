import type { EntityId } from '@/lib/api/entityId'

export interface AppointmentFilter {
  date?: string
  dateFrom?: string
  dateTo?: string
  specialist: EntityId | null
  status: string | null
}

export const appointmentKeys = {
  all: ['appointments'] as const,
  list: (filter: AppointmentFilter) => [...appointmentKeys.all, 'list', filter] as const,
  byClient: (clientId: EntityId) => [...appointmentKeys.all, 'client', clientId] as const,
}
