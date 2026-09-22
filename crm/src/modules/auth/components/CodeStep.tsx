import { useState, type FormEvent } from 'react'

import { useLocale } from '../../../lib/i18n/LocaleContext'
import { Alert } from '../../../ui/Alert'
import { Button } from '../../../ui/Button'
import { Heading, Text } from '../../../ui/Text'
import { TextField } from '../../../ui/TextField'

interface CodeStepProps {
  phone: string
  debugHint: string
  loading: boolean
  onSubmit: (code: string) => Promise<void>
  onBack: () => void
}

export function CodeStep({
  phone,
  debugHint,
  loading,
  onSubmit,
  onBack,
}: CodeStepProps) {
  const { t } = useLocale()
  const [code, setCode] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!code.trim()) return
    void onSubmit(code)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-heading">
        <Text tone="muted">{t('authStep')}</Text>
        <Heading>{t('authEnterCode')}</Heading>
        <Text tone="muted">{t('authCodeSent', { phone })}</Text>
      </div>

      {debugHint ? <Alert tone="info">{t('authDebug')}</Alert> : null}
      <TextField
        id="otp-code"
        name="code"
        label={t('authCodeLabel')}
        value={code}
        onChange={setCode}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        disabled={loading}
        error={submitted && !code.trim()}
        helperText={submitted && !code.trim() ? t('errorCodeRequired') : undefined}
      />

      <div className="auth-actions">
        <Button kind="quiet" disabled={loading} onClick={onBack}>
          {t('authChangePhone')}
        </Button>
        <Button type="submit" loading={loading}>
          {t('authLogin')}
        </Button>
      </div>
    </form>
  )
}
