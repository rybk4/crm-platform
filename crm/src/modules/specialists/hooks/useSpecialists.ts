import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiErrorMessage } from '@/lib/api/apiErrorMessage'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { notifications } from '@/lib/toast/notifications'
import type { TranslationKey } from '@/lib/i18n/messages'
import { specialistKeys } from '../api/specialistKeys'
import { specialistsApi } from '../api/specialistsApi'
import type { SpecialistInput } from '../types'

/** Данные раздела «Специалисты»: список и изменяющие операции. */
export function useSpecialists() {
  const { t } = useLocale()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: specialistKeys.list(),
    queryFn: ({ signal }) => specialistsApi.list({ signal }),
  })

  function mutationHandlers(successKey: TranslationKey) {
    return {
      onSuccess: async () => {
        notifications.success(t(successKey))
        await queryClient.invalidateQueries({ queryKey: specialistKeys.all })
      },
      onError: (error: unknown) => {
        notifications.error(apiErrorMessage(error, t('errorUnexpected')))
      },
    }
  }

  const create = useMutation({
    mutationFn: (input: SpecialistInput) => specialistsApi.create(input),
    ...mutationHandlers('specialistCreated'),
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: SpecialistInput }) =>
      specialistsApi.update(id, input),
    ...mutationHandlers('specialistUpdated'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => specialistsApi.remove(id),
    ...mutationHandlers('specialistDeleted'),
  })

  return {
    specialists: query.data ?? [],
    isLoading: query.isPending,
    create,
    update,
    remove,
    saving: create.isPending || update.isPending,
  }
}
