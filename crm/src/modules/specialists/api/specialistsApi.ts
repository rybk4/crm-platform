import { authenticatedRequest } from '../../../lib/api/http'
import type { Specialist, SpecialistInput } from '../types'

export const specialistsApi = {
  list: () => authenticatedRequest<Specialist[]>('/api/specialists/'),
  create: (input: SpecialistInput) => authenticatedRequest<Specialist>('/api/specialists/', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, input: SpecialistInput) => authenticatedRequest<Specialist>(`/api/specialists/${id}/`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: number) => authenticatedRequest<void>(`/api/specialists/${id}/`, { method: 'DELETE' }),
}
