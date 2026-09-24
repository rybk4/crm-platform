import { useCallback, useState } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { notifications } from '@/lib/toast/notifications'
import type { Service } from '@/modules/services/types'
import {
  appointmentToForm,
  combineDateTime,
  emptyAppointmentForm,
  hasOverlap,
  isAppointmentFormValid,
  splitStartsAt,
} from '../model'
import type { Appointment, AppointmentInput } from '../types'
import type { useAppointments } from './useAppointments'

interface UseAppointmentDialogOptions {
  appointments: readonly Appointment[]
  services: readonly Service[]
  defaultDay: string
  defaultSpecialistId: number
  journal: Pick<ReturnType<typeof useAppointments>, 'create' | 'update'>
}

const DEFAULT_TIME = '10:00'

/** Состояние формы записи: поля, проверка пересечений и отправка. */
export function useAppointmentDialog({
  appointments,
  services,
  defaultDay,
  defaultSpecialistId,
  journal,
}: UseAppointmentDialogOptions) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [form, setForm] = useState<AppointmentInput>(() => emptyAppointmentForm())
  const [day, setDay] = useState(defaultDay)
  const [time, setTime] = useState(DEFAULT_TIME)

  const openCreate = useCallback(
    (specialistId = defaultSpecialistId, startTime = DEFAULT_TIME) => {
      setEditing(null)
      setForm(emptyAppointmentForm(specialistId))
      setDay(defaultDay)
      setTime(startTime)
      setOpen(true)
    },
    [defaultDay, defaultSpecialistId],
  )

  const openEdit = useCallback((appointment: Appointment) => {
    const parts = splitStartsAt(appointment.starts_at)

    setEditing(appointment)
    setForm(appointmentToForm(appointment))
    setDay(parts.day)
    setTime(parts.time)
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  const patch = useCallback((changes: Partial<AppointmentInput>) => {
    setForm((current) => ({ ...current, ...changes }))
  }, [])

  /** Смена специалиста сбрасывает услугу: услуги привязаны к мастеру. */
  const patchSpecialist = useCallback((specialist: number) => {
    setForm((current) => ({ ...current, specialist, service: 0 }))
  }, [])

  async function submit() {
    const startsAt = combineDateTime(day, time)
    const payload: AppointmentInput = { ...form, starts_at: startsAt }
    const service = services.find((item) => item.id === form.service)

    if (!isAppointmentFormValid(payload) || !service) {
      notifications.error(t('requiredFields'))
      return
    }

    const conflict = hasOverlap(appointments, {
      specialist: payload.specialist,
      startsAt,
      durationMinutes: service.duration_minutes,
      excludeId: editing?.id,
    })

    if (conflict) {
      notifications.error(t('appointmentOverlap'))
      return
    }

    try {
      await (editing
        ? journal.update.mutateAsync({ id: editing.id, input: payload })
        : journal.create.mutateAsync(payload))
      setOpen(false)
    } catch {
      // Сообщение уже показала мутация — форму оставляем открытой с данными.
    }
  }

  return {
    open,
    editing,
    form,
    day,
    time,
    openCreate,
    openEdit,
    close,
    patch,
    patchSpecialist,
    setDay,
    setTime,
    submit,
  }
}
