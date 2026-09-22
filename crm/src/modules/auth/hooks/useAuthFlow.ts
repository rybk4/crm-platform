import { useCallback, useEffect, useState } from 'react'

import { apiErrorMessage } from '@/lib/api/apiErrorMessage'
import { subscribeSessionExpired } from '@/lib/auth/session'
import { clearTokens, readTokens, writeTokens } from '@/lib/auth/tokenStorage'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Locale } from '@/lib/i18n/locale'
import { notifications } from '@/lib/toast/notifications'
import { isValidPhone, normalizePhone } from '@/lib/validation/phone'
import { authApi } from '../api/authApi'
import type { AuthUser } from '../types'

type AuthStage = 'initializing' | 'phone' | 'code' | 'authenticated'

export function useAuthFlow() {
  const { t } = useLocale()
  const [stage, setStage] = useState<AuthStage>('initializing')
  const [phone, setPhone] = useState('+7')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [debugHint, setDebugHint] = useState('')
  const [loading, setLoading] = useState(false)

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    setDebugHint('')
    setStage('phone')
  }, [])

  // Клиент сам обновляет access-токен; сюда приходит только окончательный отказ.
  useEffect(() => subscribeSessionExpired(logout), [logout])

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      if (!readTokens()) {
        if (!cancelled) setStage('phone')
        return
      }

      try {
        const currentUser = await authApi.getCurrentUser()
        if (cancelled) return
        setUser(currentUser)
        setStage('authenticated')
      } catch {
        clearTokens()
        if (!cancelled) setStage('phone')
      }
    }

    void restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  async function submitPhone(rawPhone: string) {
    const normalized = normalizePhone(rawPhone)
    if (!isValidPhone(normalized)) {
      notifications.error(t('errorPhoneFormat'))
      return
    }

    setLoading(true)
    try {
      const response = await authApi.requestOtp(normalized)
      setPhone(normalized)
      setDebugHint(response.debug ?? '')
      setStage('code')
      notifications.info(response.detail)
    } catch (error) {
      notifications.error(apiErrorMessage(error, t('errorUnexpected')))
    } finally {
      setLoading(false)
    }
  }

  async function submitCode(code: string) {
    if (!code.trim()) {
      notifications.error(t('errorCodeRequired'))
      return
    }

    setLoading(true)
    try {
      const response = await authApi.verifyOtp(phone, code.trim())
      writeTokens({ access: response.access, refresh: response.refresh })
      setUser(response.user)
      setStage('authenticated')
      notifications.success(response.detail)
    } catch (error) {
      notifications.error(apiErrorMessage(error, t('errorUnexpected')))
    } finally {
      setLoading(false)
    }
  }

  function backToPhone() {
    setDebugHint('')
    setStage('phone')
  }

  async function updateLocale(locale: Locale) {
    setUser(await authApi.updateLocale(locale))
  }

  async function updateActiveBranch(activeBranch: number) {
    setUser(await authApi.updateActiveBranch(activeBranch))
  }

  return {
    stage,
    phone,
    user,
    debugHint,
    loading,
    submitPhone,
    submitCode,
    backToPhone,
    logout,
    updateLocale,
    updateActiveBranch,
  }
}

export type AuthFlow = ReturnType<typeof useAuthFlow>
