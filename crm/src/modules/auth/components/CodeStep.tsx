import { useState, type FormEvent } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { formatPhoneInput } from '@/lib/validation/phone'
import { Alert } from '@/ui/Alert'
import { Button } from '@/ui/Button'
import { OtpInput } from '@/ui/OtpInput'
import { Text } from '@/ui/Text'
import type { CodeStepProps } from './CodeStep.types'
export type { CodeStepProps } from './CodeStep.types'

export function CodeStep({ phone, loading, rejected, onEdit, onSubmit, onBack }: CodeStepProps) {
  const { t } = useLocale()
  const [code, setCode] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!/^\d{4}$/.test(code)) return
    void onSubmit(code)
  }

  return (
    <form className="auth-form auth-form--code" onSubmit={handleSubmit} noValidate>
      <div className="auth-code-copy" role="status" aria-live="polite">
        <Text>{t('authCodeDestination')}</Text>
        <strong className="auth-code-phone">{formatPhoneInput(phone)}</strong>
      </div>

      <div className="auth-code-field">
        <OtpInput
          value={code}
          onChange={(value) => {
            setCode(value)
            onEdit()
          }}
          disabled={loading}
          error={rejected || (submitted && !/^\d{4}$/.test(code))}
          getDigitLabel={(position) => t('authCodeDigit', { position })}
        />

        {submitted && !/^\d{4}$/.test(code) ? <Alert>{t('errorCodeFormat')}</Alert> : null}
      </div>

      <Button
        className="auth-code-submit"
        type="submit"
        fullWidth
        loading={loading}
        disabled={code.length !== 4}
      >
        {t('authLogin')}
      </Button>
      <button className="auth-code-change" type="button" disabled={loading} onClick={onBack}>
        {t('authChangePhone')}
      </button>
    </form>
  )
}
