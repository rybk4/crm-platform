import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiErrorMessage } from '@/lib/api/apiErrorMessage'
import type { EntityId } from '@/lib/api/entityId'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { TranslationKey } from '@/lib/i18n/messages'
import { notifications } from '@/lib/toast/notifications'
import { clientKeys } from '../api/clientKeys'
import { clientsApi } from '../api/clientsApi'
import type { ClientInput, ClientListFilters } from '../types'

/** Клиентская база: список (с серверными фильтрами) и изменяющие операции. */
export function useClients(filters: ClientListFilters = {}) {
  const { t } = useLocale()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: clientKeys.list(filters),
    queryFn: ({ signal }) => clientsApi.list(filters, { signal }),
    placeholderData: keepPreviousData,
  })

  function mutationHandlers(successKey: TranslationKey) {
    return {
      onSuccess: async () => {
        notifications.success(t(successKey))
        await queryClient.invalidateQueries({ queryKey: clientKeys.all })
      },
      onError: (error: unknown) => {
        notifications.error(apiErrorMessage(error, t('errorUnexpected')))
      },
    }
  }

  const create = useMutation({
    mutationFn: (input: ClientInput) => clientsApi.create(input),
    ...mutationHandlers('clientCreated'),
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: EntityId; input: ClientInput }) =>
      clientsApi.update(id, input),
    ...mutationHandlers('clientUpdated'),
  })

  const remove = useMutation({
    mutationFn: (id: EntityId) => clientsApi.remove(id),
    ...mutationHandlers('clientDeleted'),
  })

  return {
    clients: query.data ?? [],
    isLoading: query.isPending,
    create,
    update,
    remove,
    saving: create.isPending || update.isPending,
  }
}
