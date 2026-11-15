import { useState, type FormEvent } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { formatPhoneInput, isValidPhone, normalizePhone } from '@/lib/validation/phone'
import { Button } from '@/ui/Button'
import { TextField } from '@/ui/TextField'
import type { PhoneStepProps } from './PhoneStep.types'
export type { PhoneStepProps } from './PhoneStep.types'

export function PhoneStep({ initialPhone, loading, rejected, onEdit, onSubmit }: PhoneStepProps) {
  const { t } = useLocale()
  const [phone, setPhone] = useState(() =>
    initialPhone === '+7' ? '' : formatPhoneInput(initialPhone),
  )
  const [submitted, setSubmitted] = useState(false)
  const normalizedPhone = normalizePhone(phone)
  const validPhone = isValidPhone(normalizedPhone) && normalizedPhone.length === 12

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!validPhone) return
    void onSubmit(phone)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <TextField
        id="phone-number"
        name="phone_number"
        label={t('authPhoneLabel')}
        value={phone}
        onChange={(value) => {
          setPhone(/\d/.test(value) ? formatPhoneInput(value) : '')
          onEdit()
        }}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={t('authPhonePlaceholder')}
        disabled={loading}
        error={rejected || (submitted && !validPhone)}
        helperText={submitted && !validPhone ? t('errorPhoneFormat') : undefined}
      />

      <Button type="submit" fullWidth loading={loading} disabled={!validPhone}>
        {t('authGetCode')}
      </Button>
    </form>
  )
}
