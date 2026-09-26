import { useState } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { notifications } from '@/lib/toast/notifications'
import type { Service } from '@/modules/services/types'
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
  const [tab, setTab] = useState<SpecialistProfileTab>('about')
  const [schedule, setSchedule] = useState<WorkSchedule[]>(() =>
    specialist.schedule.map((day) => ({ ...day })),
  )
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>(() =>
    services.filter((service) => service.specialist === specialist.id).map((service) => service.id),
  )
  const [vacationStart, setVacationStart] = useState('')
  const [vacationEnd, setVacationEnd] = useState('')
  const [payoutModel, setPayoutModel] = useState('percent')
  const [payoutValue, setPayoutValue] = useState('40')

  function patchScheduleDay(weekday: number, changes: Partial<WorkSchedule>) {
    setSchedule((current) =>
      current.map((day) => (day.weekday === weekday ? { ...day, ...changes } : day)),
    )
  }

  function toggleService(serviceId: number, selected: boolean) {
    setSelectedServiceIds((current) =>
      selected ? [...new Set([...current, serviceId])] : current.filter((id) => id !== serviceId),
    )
  }

  function saveDraft() {
    notifications.success(t('specialistDraftSaved'))
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
  }
}
