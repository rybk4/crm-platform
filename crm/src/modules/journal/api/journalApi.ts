import { ApiClient } from '@/lib/api/ApiClient'
import type { Appointment, AppointmentInput, AppointmentStatus } from '../types'

interface ListOptions {
  date?: string
  specialist?: number | null
  status?: string | null
  signal?: AbortSignal
}

class JournalApi extends ApiClient {
  constructor() {
    super('/api/appointments/')
  }

  list({ date, specialist, status, signal }: ListOptions = {}) {
    return this.get<Appointment[]>('', {
      signal,
      params: {
        date,
        specialist: specialist ?? undefined,
        status: status ?? undefined,
      },
    })
  }

  create(input: AppointmentInput) {
    return this.post<Appointment>('', input)
  }

  update(id: number, input: AppointmentInput) {
    return this.put<Appointment>(`${id}/`, input)
  }

  changeStatus(id: number, status: AppointmentStatus) {
    return this.patch<Appointment>(`${id}/`, { status })
  }

  remove(id: number) {
    return this.delete(`${id}/`)
  }
}

export const journalApi = new JournalApi()
