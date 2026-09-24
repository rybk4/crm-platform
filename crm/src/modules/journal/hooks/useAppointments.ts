import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiErrorMessage } from '@/lib/api/apiErrorMessage'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { TranslationKey } from '@/lib/i18n/messages'
import { notifications } from '@/lib/toast/notifications'
import { appointmentKeys, type AppointmentFilter } from '../api/journalKeys'
import { journalApi } from '../api/journalApi'
import type { AppointmentInput, AppointmentStatus } from '../types'

/** Записи выбранного дня и операции над ними. */
export function useAppointments(filter: AppointmentFilter) {
  const { t } = useLocale()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: appointmentKeys.list(filter),
    queryFn: ({ signal }) =>
      journalApi.list({
        date: filter.date,
        specialist: filter.specialist,
        status: filter.status,
        signal,
      }),
  })

  function mutationHandlers(successKey: TranslationKey) {
    return {
      onSuccess: async () => {
        notifications.success(t(successKey))
        await queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      },
      onError: (error: unknown) => {
        notifications.error(apiErrorMessage(error, t('errorUnexpected')))
      },
    }
  }

  const create = useMutation({
    mutationFn: (input: AppointmentInput) => journalApi.create(input),
    ...mutationHandlers('appointmentCreated'),
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: AppointmentInput }) =>
      journalApi.update(id, input),
    ...mutationHandlers('appointmentUpdated'),
  })

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AppointmentStatus }) =>
      journalApi.changeStatus(id, status),
    ...mutationHandlers('appointmentUpdated'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => journalApi.remove(id),
    ...mutationHandlers('appointmentDeleted'),
  })

  return {
    appointments: query.data ?? [],
    isLoading: query.isPending,
    create,
    update,
    changeStatus,
    remove,
    saving: create.isPending || update.isPending,
  }
}
