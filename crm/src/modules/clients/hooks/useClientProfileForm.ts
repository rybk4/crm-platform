import { useMemo } from 'react'

import { clientToForm, formToClientInput, isClientFormDirty } from '../model'
import type { Client } from '../types'
import { useClientFormState } from './useClientFormState'
import type { useClients } from './useClients'

interface UseClientProfileFormOptions {
  client: Client
  clients: Pick<ReturnType<typeof useClients>, 'update' | 'saving'>
}

/** Вкладка «Профиль клиента»: черновик правок поверх сохранённых данных. */
export function useClientProfileForm({ client, clients }: UseClientProfileFormOptions) {
  const initial = useMemo(() => clientToForm(client), [client])
  const state = useClientFormState(initial)

  async function submit() {
    if (!state.validate()) return

    try {
      const saved = await clients.update.mutateAsync({
        id: client.id,
        input: formToClientInput(state.form),
      })
      state.replace(clientToForm(saved))
    } catch {
      // Сообщение уже показала мутация — черновик остаётся на экране.
    }
  }

  return {
    form: state.form,
    errors: state.errors,
    patch: state.patch,
    dirty: isClientFormDirty(state.form, initial),
    saving: clients.saving,
    reset: () => state.replace(initial),
    submit,
  }
}
