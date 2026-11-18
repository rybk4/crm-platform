import { useState } from 'react'
import type { FormEvent } from 'react'

import { formatPhoneInput, isValidPhone, normalizePhone } from '@/lib/validation/phone'
import type { PhoneStepProps } from '../components/PhoneStep.types'

export function usePhoneStep({
  initialPhone,
  onEdit,
  onSubmit,
}: Pick<PhoneStepProps, 'initialPhone' | 'onEdit' | 'onSubmit'>) {
  const [phone, setPhone] = useState(() =>
    initialPhone === '+7' ? '' : formatPhoneInput(initialPhone),
  )
  const [submitted, setSubmitted] = useState(false)
  const [blurred, setBlurred] = useState(false)
  const normalized = normalizePhone(phone)
  const valid = isValidPhone(normalized) && normalized.length === 12

  function change(value: string) {
    setPhone(value)
    onEdit()
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (valid) void onSubmit(phone)
  }

  return {
    phone,
    valid,
    invalid: (submitted || blurred) && !valid,
    change,
    submit,
    blur: () => setBlurred(true),
  }
}
