import { authenticatedRequest } from '../../../lib/api/http'
import type { Service, ServiceInput } from '../types'

export const servicesApi = {
  list: () => authenticatedRequest<Service[]>('/api/services/'),
  create: (input: ServiceInput) => authenticatedRequest<Service>('/api/services/', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, input: ServiceInput) => authenticatedRequest<Service>(`/api/services/${id}/`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: number) => authenticatedRequest<void>(`/api/services/${id}/`, { method: 'DELETE' }),
}
