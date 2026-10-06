import { ApiClient } from '@/lib/api/ApiClient'
import type { EntityId } from '@/lib/api/entityId'
import type { Appointment, AppointmentInput, AppointmentStatus, DealPaymentInput } from '../types'

interface ListOptions {
  date?: string
  dateFrom?: string
  dateTo?: string
  specialist?: EntityId | null
  status?: string | null
  signal?: AbortSignal
}

class JournalApi extends ApiClient {
  constructor() {
    super('/api/appointments/')
  }

  list({ date, dateFrom, dateTo, specialist, status, signal }: ListOptions = {}) {
    return this.get<Appointment[]>('', {
      signal,
      params: {
        date,
        date_from: dateFrom,
        date_to: dateTo,
        specialist: specialist ?? undefined,
        status: status ?? undefined,
      },
    })
  }

  create(input: AppointmentInput) {
    return this.post<Appointment>('', input)
  }

  update(id: EntityId, input: AppointmentInput) {
    return this.put<Appointment>(`${id}/`, input)
  }

  changeStatus(id: EntityId, status: AppointmentStatus) {
    return this.patch<Appointment>(`${id}/`, { status })
  }

  remove(id: EntityId) {
    return this.delete(`${id}/`)
  }
}

export const journalApi = new JournalApi()

class DealsApi extends ApiClient {
  constructor() {
    super('/api/deals/')
  }

  close(id: EntityId, input: DealPaymentInput) {
    return this.patch(`${id}/close/`, input)
  }
}

export const dealsApi = new DealsApi()
