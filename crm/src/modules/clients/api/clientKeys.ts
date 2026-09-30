import type { ClientListFilters } from '../types'

export const clientKeys = {
  all: ['clients'] as const,
  list: (filters: ClientListFilters = {}) => [...clientKeys.all, 'list', filters] as const,
  detail: (clientId: number) => [...clientKeys.all, 'detail', clientId] as const,
  visits: (clientId: number) => [...clientKeys.all, 'visits', clientId] as const,
}
