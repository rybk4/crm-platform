import { ApiClient } from '@/lib/api/ApiClient'
import type { EntityId } from '@/lib/api/entityId'
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

  update(id: EntityId, input: SpecialistInput) {
    return this.put<Specialist>(`${id}/`, input)
  }

  updateProfile(id: EntityId, input: Partial<SpecialistInput>) {
    return this.patch<Specialist>(`${id}/`, input)
  }

  updateServices(id: EntityId, serviceIds: EntityId[]) {
    return this.put<Specialist>(`${id}/services/`, { service_ids: serviceIds })
  }

  remove(id: EntityId) {
    return this.delete(`${id}/`)
  }
}

export const specialistsApi = new SpecialistsApi()
