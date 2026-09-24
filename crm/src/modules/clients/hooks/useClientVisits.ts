import { useQuery } from '@tanstack/react-query'

import { clientKeys } from '../api/clientKeys'
import { clientsApi } from '../api/clientsApi'

/** История визитов подгружается только когда открыта карточка клиента. */
export function useClientVisits(clientId: number | null) {
  return useQuery({
    queryKey: clientKeys.visits(clientId ?? 0),
    queryFn: ({ signal }) => clientsApi.visits(clientId ?? 0, { signal }),
    enabled: clientId !== null,
  })
}
