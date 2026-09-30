import { useCallback, useState } from 'react'

import { formatPhoneInput } from '@/lib/validation/phone'
import { validateClientForm } from '../model'
import type { ClientForm, ClientFormErrors, ClientFormField } from '../model'

/** Общая часть формы клиента: поля, ошибки на полях и проверка перед отправкой. */
export function useClientFormState(initial: ClientForm) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<ClientFormErrors>({})

  const patch = useCallback(<K extends ClientFormField>(field: K, value: ClientForm[K]) => {
    const next = field === 'phone_number' ? formatPhoneInput(String(value)) : value
    setForm((current) => ({ ...current, [field]: next }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }, [])

  const replace = useCallback((next: ClientForm) => {
    setForm(next)
    setErrors({})
  }, [])

  /** Показывает ошибки на полях и говорит, можно ли отправлять. */
  function validate() {
    const next = validateClientForm(form)
    setErrors(next)
    return Object.keys(next).length === 0
  }

  return { form, errors, patch, replace, validate }
}
