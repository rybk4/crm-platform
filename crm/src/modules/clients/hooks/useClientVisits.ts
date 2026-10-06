import { useQuery } from '@tanstack/react-query'
import type { EntityId } from '@/lib/api/entityId'

import { clientKeys } from '../api/clientKeys'
import { clientsApi } from '../api/clientsApi'

/** Все визиты клиента; период и сортировку считает вкладка истории. */
export function useClientVisits(clientId: EntityId) {
  return useQuery({
    queryKey: clientKeys.visits(clientId),
    queryFn: ({ signal }) => clientsApi.visits(clientId, { signal }),
  })
}
