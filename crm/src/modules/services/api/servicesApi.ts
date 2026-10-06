import { ApiClient } from '@/lib/api/ApiClient'
import type { EntityId } from '@/lib/api/entityId'
import type { Service, ServiceInput } from '../types'

class ServicesApi extends ApiClient {
  constructor() {
    super('/api/services/')
  }

  list(options?: { signal?: AbortSignal }) {
    return this.get<Service[]>('', options)
  }

  create(input: ServiceInput) {
    return this.post<Service>('', input)
  }

  update(id: EntityId, input: ServiceInput) {
    return this.put<Service>(`${id}/`, input)
  }

  remove(id: EntityId) {
    return this.delete(`${id}/`)
  }
}

export const servicesApi = new ServicesApi()
