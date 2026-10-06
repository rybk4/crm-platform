import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { sameEntityId, type EntityId } from '@/lib/api/entityId'
import { apiErrorMessage } from '@/lib/api/apiErrorMessage'
import { notifications } from '@/lib/toast/notifications'
import type { Service } from '@/modules/services/types'
import { specialistKeys } from '../api/specialistKeys'
import { specialistsApi } from '../api/specialistsApi'
import type { Specialist, WorkSchedule } from '../types'

export const specialistProfileTabs = [
  'about',
  'schedule',
  'services',
  'vacations',
  'payouts',
] as const
export type SpecialistProfileTab = (typeof specialistProfileTabs)[number]

export function useSpecialistProfile(specialist: Specialist, services: readonly Service[]) {
  const { t } = useLocale()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<SpecialistProfileTab>('about')
  const [schedule, setSchedule] = useState<WorkSchedule[]>(() =>
    specialist.schedule.map((day) => ({ ...day })),
  )
  const [selectedServiceIds, setSelectedServiceIds] = useState<EntityId[]>(() =>
    services
      .filter(
        (service) =>
          sameEntityId(service.specialist, specialist.id) ||
          service.specialists?.some((id) => sameEntityId(id, specialist.id)),
      )
      .map((service) => service.id),
  )
  const [vacationStart, setVacationStart] = useState(specialist.vacation_start ?? '')
  const [vacationEnd, setVacationEnd] = useState(specialist.vacation_end ?? '')
  const [payoutModel, setPayoutModel] = useState(specialist.payout_model ?? 'percent')
  const [payoutValue, setPayoutValue] = useState(specialist.payout_value ?? '40')

  const save = useMutation({
    mutationFn: async () => {
      if (tab === 'schedule') {
        return specialistsApi.updateProfile(specialist.id, { schedule })
      }
      if (tab === 'services') {
        return specialistsApi.updateServices(specialist.id, selectedServiceIds)
      }
      if (tab === 'vacations') {
        return specialistsApi.updateProfile(specialist.id, {
          vacation_start: vacationStart || null,
          vacation_end: vacationEnd || null,
        })
      }
      return specialistsApi.updateProfile(specialist.id, {
        payout_model: payoutModel as 'percent' | 'fixed' | 'salary',
        payout_value: payoutValue,
      })
    },
    onSuccess: async () => {
      notifications.success(t('specialistDraftSaved'))
      await queryClient.invalidateQueries({ queryKey: specialistKeys.all })
    },
    onError: (error: unknown) => {
      notifications.error(apiErrorMessage(error, t('errorUnexpected')))
    },
  })

  function patchScheduleDay(weekday: number, changes: Partial<WorkSchedule>) {
    setSchedule((current) =>
      current.map((day) => (day.weekday === weekday ? { ...day, ...changes } : day)),
    )
  }

  function toggleService(serviceId: EntityId, selected: boolean) {
    setSelectedServiceIds((current) =>
      selected ? [...new Set([...current, serviceId])] : current.filter((id) => id !== serviceId),
    )
  }

  function saveDraft() {
    save.mutate()
  }

  return {
    tab,
    setTab,
    schedule,
    patchScheduleDay,
    selectedServiceIds,
    toggleService,
    vacationStart,
    setVacationStart,
    vacationEnd,
    setVacationEnd,
    payoutModel,
    setPayoutModel,
    payoutValue,
    setPayoutValue,
    saveDraft,
    saving: save.isPending,
  }
}
