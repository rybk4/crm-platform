import type { EntityId } from '@/lib/api/entityId'
import type { ClientListFilters } from '../types'

export const clientKeys = {
  all: ['clients'] as const,
  list: (filters: ClientListFilters = {}) => [...clientKeys.all, 'list', filters] as const,
  detail: (clientId: EntityId) => [...clientKeys.all, 'detail', clientId] as const,
  visits: (clientId: EntityId) => [...clientKeys.all, 'visits', clientId] as const,
}
