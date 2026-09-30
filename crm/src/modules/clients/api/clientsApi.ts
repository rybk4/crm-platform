import { ApiClient } from '@/lib/api/ApiClient'
import type { Client, ClientInput, ClientListFilters, ClientVisit } from '../types'

class ClientsApi extends ApiClient {
  constructor() {
    super('/api/clients/')
  }

  list(filters: ClientListFilters = {}, options?: { signal?: AbortSignal }) {
    return this.get<Client[]>('', { ...options, params: { ...filters } })
  }

  detail(clientId: number, options?: { signal?: AbortSignal }) {
    return this.get<Client>(`${clientId}/`, options)
  }

  visits(clientId: number, options?: { signal?: AbortSignal }) {
    return this.get<ClientVisit[]>(`${clientId}/visits/`, options)
  }

  create(input: ClientInput) {
    return this.post<Client>('', input)
  }

  update(id: number, input: ClientInput) {
    return this.put<Client>(`${id}/`, input)
  }

  remove(id: number) {
    return this.delete(`${id}/`)
  }
}

export const clientsApi = new ClientsApi()
