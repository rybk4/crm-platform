import { useCallback, useState } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { notifications } from '@/lib/toast/notifications'
import { clientToForm, emptyClientForm, isClientFormValid } from '../model'
import type { Client, ClientInput } from '../types'
import type { useClients } from './useClients'

interface UseClientDialogOptions {
  clients: Pick<ReturnType<typeof useClients>, 'create' | 'update'>
}

/** Состояние формы клиента: открытие, правки полей и отправка. */
export function useClientDialog({ clients }: UseClientDialogOptions) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState<ClientInput>(() => emptyClientForm())

  const openCreate = useCallback(() => {
    setEditing(null)
    setForm(emptyClientForm())
    setOpen(true)
  }, [])

  const openEdit = useCallback((client: Client) => {
    setEditing(client)
    setForm(clientToForm(client))
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  const patch = useCallback((changes: Partial<ClientInput>) => {
    setForm((current) => ({ ...current, ...changes }))
  }, [])

  async function submit() {
    if (!isClientFormValid(form)) {
      notifications.error(t('requiredFields'))
      return
    }

    try {
      await (editing
        ? clients.update.mutateAsync({ id: editing.id, input: form })
        : clients.create.mutateAsync(form))
      setOpen(false)
    } catch {
      // Сообщение уже показала мутация — форму оставляем открытой с данными.
    }
  }

  return { open, editing, form, openCreate, openEdit, close, patch, submit }
}
