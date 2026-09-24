import { useState, type FormEvent } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { Alert } from '@/ui/Alert'
import { Button } from '@/ui/Button'
import { OtpInput } from '@/ui/OtpInput'
import { Text } from '@/ui/Text'

interface CodeStepProps {
  phone: string
  debugHint: string
  loading: boolean
  errorMessage: string
  onSubmit: (code: string) => Promise<void>
  onBack: () => void
}

export function CodeStep({
  phone,
  debugHint,
  loading,
  errorMessage,
  onSubmit,
  onBack,
}: CodeStepProps) {
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
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-code-copy">
        <Text className="auth-code-label">{t('authSmsCodeLabel')}</Text>
        <Text tone="muted">{t('authCodeSent', { phone })}</Text>
      </div>

      <OtpInput
        value={code}
        onChange={setCode}
        disabled={loading}
        error={submitted && !/^\d{4}$/.test(code)}
        getDigitLabel={(position) => t('authCodeDigit', { position })}
      />

      {submitted && !/^\d{4}$/.test(code) ? <Alert>{t('errorCodeFormat')}</Alert> : null}
      {errorMessage ? <Alert>{errorMessage}</Alert> : null}
      {debugHint ? <p className="auth-debug">{t('authDebugCode', { code: debugHint })}</p> : null}

      <Button type="submit" fullWidth loading={loading} disabled={code.length !== 4}>
        {t('authLogin')}
      </Button>
      <button className="auth-back" type="button" disabled={loading} onClick={onBack}>
        {t('authChangePhone')}
      </button>
    </form>
  )
}
