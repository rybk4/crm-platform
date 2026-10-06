import { ApiClient } from '@/lib/api/ApiClient'
import type { EntityId } from '@/lib/api/entityId'
import type { Client, ClientInput, ClientListFilters, ClientVisit } from '../types'

class ClientsApi extends ApiClient {
  constructor() {
    super('/api/clients/')
  }

  list(filters: ClientListFilters = {}, options?: { signal?: AbortSignal }) {
    return this.get<Client[]>('', { ...options, params: { ...filters } })
  }

  detail(clientId: EntityId, options?: { signal?: AbortSignal }) {
    return this.get<Client>(`${clientId}/`, options)
  }

  visits(clientId: EntityId, options?: { signal?: AbortSignal }) {
    return this.get<ClientVisit[]>(`${clientId}/visits/`, options)
  }

  create(input: ClientInput) {
    return this.post<Client>('', input)
  }

  update(id: EntityId, input: ClientInput) {
    return this.put<Client>(`${id}/`, input)
  }

  remove(id: EntityId) {
    return this.delete(`${id}/`)
  }
}

export const clientsApi = new ClientsApi()
