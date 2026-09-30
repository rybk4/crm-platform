import { useQuery } from '@tanstack/react-query'

import { clientKeys } from '../api/clientKeys'
import { clientsApi } from '../api/clientsApi'

/** Все визиты клиента; период и сортировку считает вкладка истории. */
export function useClientVisits(clientId: number) {
  return useQuery({
    queryKey: clientKeys.visits(clientId),
    queryFn: ({ signal }) => clientsApi.visits(clientId, { signal }),
  })
}
