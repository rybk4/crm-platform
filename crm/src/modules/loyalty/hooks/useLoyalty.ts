import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiErrorMessage } from '@/lib/api/apiErrorMessage'
import type { EntityId } from '@/lib/api/entityId'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { notifications } from '@/lib/toast/notifications'
import { loyaltyApi } from '../api/loyaltyApi'
import type { LoyaltyProgramInput } from '../types'

const loyaltyKey = ['loyalty-programs'] as const
export function useLoyalty() {
  const { t } = useLocale()
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: loyaltyKey,
    queryFn: ({ signal }) => loyaltyApi.list({ signal }),
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: loyaltyKey })
  const failure = (error: unknown) =>
    notifications.error(apiErrorMessage(error, t('errorUnexpected')))
  const create = useMutation({
    mutationFn: (input: LoyaltyProgramInput) => loyaltyApi.create(input),
    onSuccess: () => {
      notifications.success(t('loyaltySaved'))
      void refresh()
    },
    onError: failure,
  })
  const update = useMutation({
    mutationFn: ({ id, input }: { id: EntityId; input: LoyaltyProgramInput }) =>
      loyaltyApi.update(id, input),
    onSuccess: () => {
      notifications.success(t('loyaltySaved'))
      void refresh()
    },
    onError: failure,
  })
  const remove = useMutation({
    mutationFn: (id: EntityId) => loyaltyApi.remove(id),
    onSuccess: () => {
      notifications.success(t('loyaltyDeleted'))
      void refresh()
    },
    onError: failure,
  })
  return { programs: query.data ?? [], isLoading: query.isLoading, create, update, remove }
}
