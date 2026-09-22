import { ApiClient } from '@/lib/api/ApiClient'
import type { Specialist, SpecialistInput } from '../types'

class SpecialistsApi extends ApiClient {
  constructor() {
    super('/api/specialists/')
  }

  list(options?: { signal?: AbortSignal }) {
    return this.get<Specialist[]>('', options)
  }

  create(input: SpecialistInput) {
    return this.post<Specialist>('', input)
  }

  update(id: number, input: SpecialistInput) {
    return this.put<Specialist>(`${id}/`, input)
  }

  remove(id: number) {
    return this.delete(`${id}/`)
  }
}

export const specialistsApi = new SpecialistsApi()
