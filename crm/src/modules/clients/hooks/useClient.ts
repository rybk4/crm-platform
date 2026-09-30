import { useQuery } from '@tanstack/react-query'

import { clientKeys } from '../api/clientKeys'
import { clientsApi } from '../api/clientsApi'

/** Один клиент для страницы профиля. */
export function useClient(clientId: number) {
  return useQuery({
    queryKey: clientKeys.detail(clientId),
    queryFn: ({ signal }) => clientsApi.detail(clientId, { signal }),
    enabled: Number.isFinite(clientId) && clientId > 0,
  })
}
