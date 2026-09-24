import { useState, type FormEvent } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { formatPhoneInput, isValidPhone, normalizePhone } from '@/lib/validation/phone'
import { Alert } from '@/ui/Alert'
import { Button } from '@/ui/Button'
import { TextField } from '@/ui/TextField'

interface PhoneStepProps {
  initialPhone: string
  loading: boolean
  errorMessage: string
  onSubmit: (phone: string) => Promise<void>
}

export function PhoneStep({ initialPhone, loading, errorMessage, onSubmit }: PhoneStepProps) {
  const { t } = useLocale()
  const [phone, setPhone] = useState(() => formatPhoneInput(initialPhone))
  const [submitted, setSubmitted] = useState(false)
  const normalizedPhone = normalizePhone(phone)
  const invalidPhone = phone !== '+7' && !isValidPhone(normalizedPhone)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!isValidPhone(normalizedPhone)) return
    void onSubmit(phone)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <TextField
        id="phone-number"
        name="phone_number"
        label={t('authPhoneLabel')}
        value={phone}
        onChange={(value) => setPhone(formatPhoneInput(value))}
        inputMode="tel"
        autoComplete="tel"
        autoFocus
        placeholder={t('authPhonePlaceholder')}
        disabled={loading}
        error={invalidPhone || (submitted && !isValidPhone(normalizedPhone))}
        helperText={
          invalidPhone || (submitted && !isValidPhone(normalizedPhone))
            ? t('errorPhoneFormat')
            : undefined
        }
      />

      {errorMessage ? <Alert>{errorMessage}</Alert> : null}

      <Button type="submit" fullWidth loading={loading}>
        {t('authGetCode')}
      </Button>
    </form>
  )
}
