export interface AppointmentFilter {
  date: string
  specialist: number | null
  status: string | null
}

export const appointmentKeys = {
  all: ['appointments'] as const,
  list: (filter: AppointmentFilter) => [...appointmentKeys.all, 'list', filter] as const,
  byClient: (clientId: number) => [...appointmentKeys.all, 'client', clientId] as const,
}
