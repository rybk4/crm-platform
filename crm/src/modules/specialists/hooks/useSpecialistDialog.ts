import { useCallback, useState } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { notifications } from '@/lib/toast/notifications'
import {
  emptySpecialistForm,
  isSpecialistFormValid,
  specialistToForm,
  toSpecialistPayload,
} from '../model'
import type { Specialist, SpecialistCertificate, SpecialistInput, WorkSchedule } from '../types'
import { useSpecialists } from './useSpecialists'

interface UseSpecialistDialogOptions {
  defaultBranchId: number
  specialists: Pick<ReturnType<typeof useSpecialists>, 'create' | 'update'>
}

/** Состояние формы специалиста: открытие, правки полей и отправка. */
export function useSpecialistDialog({ defaultBranchId, specialists }: UseSpecialistDialogOptions) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Specialist | null>(null)
  const [form, setForm] = useState<SpecialistInput>(() => emptySpecialistForm())

  const openCreate = useCallback(() => {
    setEditing(null)
    setForm(emptySpecialistForm(defaultBranchId))
    setOpen(true)
  }, [defaultBranchId])

  const openEdit = useCallback((specialist: Specialist) => {
    setEditing(specialist)
    setForm(specialistToForm(specialist))
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  const patch = useCallback((changes: Partial<SpecialistInput>) => {
    setForm((current) => ({ ...current, ...changes }))
  }, [])

  const patchScheduleDay = useCallback((weekday: number, changes: Partial<WorkSchedule>) => {
    setForm((current) => ({
      ...current,
      schedule: current.schedule.map((day) =>
        day.weekday === weekday ? { ...day, ...changes } : day,
      ),
    }))
  }, [])

  const addCertificate = useCallback(() => {
    setForm((current) => ({
      ...current,
      certificates: [
        ...current.certificates,
        { title: '', image_url: '', issued_at: null, position: current.certificates.length },
      ],
    }))
  }, [])

  const patchCertificate = useCallback((index: number, changes: Partial<SpecialistCertificate>) => {
    setForm((current) => ({
      ...current,
      certificates: current.certificates.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...changes } : item,
      ),
    }))
  }, [])

  const removeCertificate = useCallback((index: number) => {
    setForm((current) => ({
      ...current,
      certificates: current.certificates.filter((_, itemIndex) => itemIndex !== index),
    }))
  }, [])

  async function submit() {
    if (!isSpecialistFormValid(form)) {
      notifications.error(t('requiredFields'))
      return
    }

    const payload = toSpecialistPayload(form)
    const request = editing
      ? specialists.update.mutateAsync({ id: editing.id, input: payload })
      : specialists.create.mutateAsync(payload)

    try {
      await request
      setOpen(false)
    } catch {
      // Сообщение уже показала мутация — форму оставляем открытой с данными.
    }
  }

  return {
    open,
    editing,
    form,
    openCreate,
    openEdit,
    close,
    patch,
    patchScheduleDay,
    addCertificate,
    patchCertificate,
    removeCertificate,
    submit,
  }
}
