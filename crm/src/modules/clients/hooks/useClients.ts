import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiErrorMessage } from '@/lib/api/apiErrorMessage'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { TranslationKey } from '@/lib/i18n/messages'
import { notifications } from '@/lib/toast/notifications'
import { clientKeys } from '../api/clientKeys'
import { clientsApi } from '../api/clientsApi'
import type { ClientInput } from '../types'

/** Клиентская база: список и изменяющие операции. */
export function useClients() {
  const { t } = useLocale()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: clientKeys.list(),
    queryFn: ({ signal }) => clientsApi.list({ signal }),
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
    mutationFn: ({ id, input }: { id: number; input: ClientInput }) => clientsApi.update(id, input),
    ...mutationHandlers('clientUpdated'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => clientsApi.remove(id),
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
