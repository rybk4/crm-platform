import { useState, type FormEvent } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { formatPhoneInput, isValidPhone, normalizePhone } from '@/lib/validation/phone'
import { Button } from '@/ui/Button'
import { Heading, Text } from '@/ui/Text'
import { TextField } from '@/ui/TextField'

interface PhoneStepProps {
  initialPhone: string
  loading: boolean
  onSubmit: (phone: string) => Promise<void>
}

export function PhoneStep({ initialPhone, loading, onSubmit }: PhoneStepProps) {
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
      <div className="auth-heading">
        <Text tone="muted">{t('authWorkspace')}</Text>
        <Heading>{t('authEnterPhone')}</Heading>
        <Text tone="muted">{t('authPhoneDescription')}</Text>
      </div>

      <TextField
        id="phone-number"
        name="phone_number"
        label={t('authPhoneLabel')}
        value={phone}
        onChange={(value) => setPhone(formatPhoneInput(value))}
        inputMode="tel"
        autoComplete="tel"
        autoFocus
        disabled={loading}
        error={invalidPhone || (submitted && !isValidPhone(normalizedPhone))}
        helperText={
          invalidPhone || (submitted && !isValidPhone(normalizedPhone))
            ? t('errorPhoneFormat')
            : t('authPhoneHelper')
        }
      />

      <Button type="submit" fullWidth loading={loading}>
        {t('authGetCode')}
      </Button>
    </form>
  )
}
