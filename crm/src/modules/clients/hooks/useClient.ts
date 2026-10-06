import { useQuery } from '@tanstack/react-query'
import type { EntityId } from '@/lib/api/entityId'

import { clientKeys } from '../api/clientKeys'
import { clientsApi } from '../api/clientsApi'

/** Один клиент для страницы профиля. */
export function useClient(clientId: EntityId) {
  return useQuery({
    queryKey: clientKeys.detail(clientId),
    queryFn: ({ signal }) => clientsApi.detail(clientId, { signal }),
    enabled: String(clientId).length > 0 && clientId !== 0,
  })
}
