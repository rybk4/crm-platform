import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiErrorMessage } from '@/lib/api/apiErrorMessage'
import type { EntityId } from '@/lib/api/entityId'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { notifications } from '@/lib/toast/notifications'
import { billsApi, paymentMethodsApi } from '../api/financeApi'
import { financeKeys } from '../api/financeKeys'
import type { BillInput, PaymentMethodInput } from '../types'

export function useFinance() {
  const { t } = useLocale()
  const queryClient = useQueryClient()
  const bills = useQuery({
    queryKey: financeKeys.bills(),
    queryFn: ({ signal }) => billsApi.list({ signal }),
  })
  const methods = useQuery({
    queryKey: financeKeys.paymentMethods(),
    queryFn: ({ signal }) => paymentMethodsApi.list({ signal }),
  })

  const success = () => notifications.success(t('financeSaved'))
  const failure = (error: unknown) =>
    notifications.error(apiErrorMessage(error, t('errorUnexpected')))
  const refresh = () => queryClient.invalidateQueries({ queryKey: financeKeys.all })
  const billCreate = useMutation({
    mutationFn: (input: BillInput) => billsApi.create(input),
    onSuccess: () => {
      success()
      void refresh()
    },
    onError: failure,
  })
  const billUpdate = useMutation({
    mutationFn: ({ id, input }: { id: EntityId; input: BillInput }) => billsApi.update(id, input),
    onSuccess: () => {
      success()
      void refresh()
    },
    onError: failure,
  })
  const billRemove = useMutation({
    mutationFn: (id: EntityId) => billsApi.remove(id),
    onSuccess: () => {
      notifications.success(t('financeDeleted'))
      void refresh()
    },
    onError: failure,
  })
  const methodCreate = useMutation({
    mutationFn: (input: PaymentMethodInput) => paymentMethodsApi.create(input),
    onSuccess: () => {
      success()
      void refresh()
    },
    onError: failure,
  })
  const methodUpdate = useMutation({
    mutationFn: ({ id, input }: { id: EntityId; input: PaymentMethodInput }) =>
      paymentMethodsApi.update(id, input),
    onSuccess: () => {
      success()
      void refresh()
    },
    onError: failure,
  })
  const methodRemove = useMutation({
    mutationFn: (id: EntityId) => paymentMethodsApi.remove(id),
    onSuccess: () => {
      notifications.success(t('financeDeleted'))
      void refresh()
    },
    onError: failure,
  })

  return {
    bills: bills.data ?? [],
    methods: methods.data ?? [],
    isLoading: bills.isLoading || methods.isLoading,
    billCreate,
    billUpdate,
    billRemove,
    methodCreate,
    methodUpdate,
    methodRemove,
  }
}
