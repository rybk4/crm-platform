import { useCallback, useState } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { notifications } from '@/lib/toast/notifications'
import { emptyServiceForm, isServiceFormValid, serviceToForm } from '../model'
import type { Service, ServiceInput } from '../types'
import type { useServices } from './useServices'

interface UseServiceDialogOptions {
  defaultSpecialistId: number
  services: Pick<ReturnType<typeof useServices>, 'create' | 'update'>
}

/** Состояние формы услуги: открытие, правки полей и отправка. */
export function useServiceDialog({ defaultSpecialistId, services }: UseServiceDialogOptions) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceInput>(() => emptyServiceForm())

  const openCreate = useCallback(() => {
    setEditing(null)
    setForm(emptyServiceForm(defaultSpecialistId))
    setOpen(true)
  }, [defaultSpecialistId])

  const openEdit = useCallback((service: Service) => {
    setEditing(service)
    setForm(serviceToForm(service))
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  const patch = useCallback((changes: Partial<ServiceInput>) => {
    setForm((current) => ({ ...current, ...changes }))
  }, [])

  async function submit() {
    if (!isServiceFormValid(form)) {
      notifications.error(t('requiredFields'))
      return
    }

    const request = editing
      ? services.update.mutateAsync({ id: editing.id, input: form })
      : services.create.mutateAsync(form)

    try {
      await request
      setOpen(false)
    } catch {
      // Сообщение уже показала мутация — форму оставляем открытой с данными.
    }
  }

  return { open, editing, form, openCreate, openEdit, close, patch, submit }
}
