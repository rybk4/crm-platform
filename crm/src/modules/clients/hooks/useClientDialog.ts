import { useCallback, useState } from 'react'

import { emptyClientForm, formToClientInput } from '../model'
import { useClientFormState } from './useClientFormState'
import type { useClients } from './useClients'

interface UseClientDialogOptions {
  clients: Pick<ReturnType<typeof useClients>, 'create'>
}

/** Окно «Добавить клиента»: открытие, поля и отправка. */
export function useClientDialog({ clients }: UseClientDialogOptions) {
  const [open, setOpen] = useState(false)
  const state = useClientFormState(emptyClientForm())
  const { replace } = state

  const openCreate = useCallback(() => {
    replace(emptyClientForm())
    setOpen(true)
  }, [replace])

  const close = useCallback(() => setOpen(false), [])

  async function submit() {
    if (!state.validate()) return

    try {
      await clients.create.mutateAsync(formToClientInput(state.form))
      setOpen(false)
    } catch {
      // Сообщение уже показала мутация — форму оставляем открытой с данными.
    }
  }

  return {
    open,
    form: state.form,
    errors: state.errors,
    patch: state.patch,
    openCreate,
    close,
    submit,
  }
}
