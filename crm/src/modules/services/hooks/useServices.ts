import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiErrorMessage } from '@/lib/api/apiErrorMessage'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { TranslationKey } from '@/lib/i18n/messages'
import { notifications } from '@/lib/toast/notifications'
import { serviceKeys } from '../api/serviceKeys'
import { servicesApi } from '../api/servicesApi'
import type { ServiceInput } from '../types'

/** Данные раздела «Услуги»: каталог и изменяющие операции. */
export function useServices() {
  const { t } = useLocale()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: serviceKeys.list(),
    queryFn: ({ signal }) => servicesApi.list({ signal }),
  })

  function mutationHandlers(successKey: TranslationKey) {
    return {
      onSuccess: async () => {
        notifications.success(t(successKey))
        await queryClient.invalidateQueries({ queryKey: serviceKeys.all })
      },
      onError: (error: unknown) => {
        notifications.error(apiErrorMessage(error, t('errorUnexpected')))
      },
    }
  }

  const create = useMutation({
    mutationFn: (input: ServiceInput) => servicesApi.create(input),
    ...mutationHandlers('serviceCreated'),
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ServiceInput }) =>
      servicesApi.update(id, input),
    ...mutationHandlers('serviceUpdated'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => servicesApi.remove(id),
    ...mutationHandlers('serviceDeleted'),
  })

  return {
    services: query.data ?? [],
    isLoading: query.isPending,
    create,
    update,
    remove,
    saving: create.isPending || update.isPending,
  }
}
