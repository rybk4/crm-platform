import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { TextField } from '@/ui/TextField'
import { usePhoneStep } from '../hooks/usePhoneStep'
import type { PhoneStepProps } from './PhoneStep.types'
export type { PhoneStepProps } from './PhoneStep.types'

export function PhoneStep({ initialPhone, loading, rejected, onEdit, onSubmit }: PhoneStepProps) {
  const { t } = useLocale()
  const field = usePhoneStep({ initialPhone, onEdit, onSubmit })

  return (
    <form className="auth-form" onSubmit={field.submit} noValidate>
      <TextField
        id="phone-number"
        name="phone_number"
        label={t('authPhoneLabel')}
        value={field.phone}
        onChange={field.change}
        onBlur={field.blur}
        mask="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={t('authPhonePlaceholder')}
        disabled={loading}
        error={rejected || field.invalid}
        helperText={
          rejected
            ? t('authUserNotFound')
            : field.invalid
              ? t('errorPhoneFormat')
              : t('authPhoneHint')
        }
      />

      <Button type="submit" fullWidth loading={loading} disabled={loading}>
        {t('authGetCode')}
      </Button>
    </form>
  )
}
