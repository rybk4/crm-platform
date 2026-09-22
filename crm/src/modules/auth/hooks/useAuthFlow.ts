import { useEffect, useState } from 'react'

import { ApiError } from '../../../lib/api/http'
import { clearTokens, readTokens, writeTokens } from '../../../lib/auth/tokenStorage'
import { useLocale } from '../../../lib/i18n/LocaleContext'
import type { Locale } from '../../../lib/i18n/locale'
import { notifications } from '../../../lib/toast/notifications'
import { isValidPhone, normalizePhone } from '../../../lib/validation/phone'
import {
  getCurrentUser,
  refreshAccessToken,
  requestOtp,
  updateCurrentUser,
  verifyOtp,
} from '../api/authApi'
import type { AuthUser } from '../types'

type AuthStage = 'initializing' | 'phone' | 'code' | 'authenticated'

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message
  return fallback
}

export function useAuthFlow() {
  const { t } = useLocale()
  const [stage, setStage] = useState<AuthStage>('initializing')
  const [phone, setPhone] = useState('+7')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [debugHint, setDebugHint] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const tokens = readTokens()
      if (!tokens) {
        if (!cancelled) setStage('phone')
        return
      }

      try {
        const currentUser = await getCurrentUser(tokens.access)
        if (!cancelled) {
          setUser(currentUser)
          setStage('authenticated')
        }
        return
      } catch {
        try {
          const refreshed = await refreshAccessToken(tokens.refresh)
          const nextTokens = { ...tokens, access: refreshed.access }
          writeTokens(nextTokens)
          const currentUser = await getCurrentUser(nextTokens.access)
          if (!cancelled) {
            setUser(currentUser)
            setStage('authenticated')
          }
          return
        } catch {
          clearTokens()
        }
      }

      if (!cancelled) setStage('phone')
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
      const response = await requestOtp(normalized)
      setPhone(normalized)
      setDebugHint(response.debug ?? '')
      setStage('code')
      notifications.info(response.detail)
    } catch (requestError) {
      notifications.error(errorMessage(requestError, t('errorUnexpected')))
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
      const response = await verifyOtp(phone, code.trim())
      writeTokens({ access: response.access, refresh: response.refresh })
      setUser(response.user)
      setStage('authenticated')
      notifications.success(response.detail)
    } catch (verifyError) {
      notifications.error(errorMessage(verifyError, t('errorUnexpected')))
    } finally {
      setLoading(false)
    }
  }

  function backToPhone() {
    setDebugHint('')
    setStage('phone')
  }

  function logout() {
    clearTokens()
    setUser(null)
    setDebugHint('')
    setStage('phone')
  }

  async function updateLocale(locale: Locale) {
    const tokens = readTokens()
    if (!tokens) throw new ApiError(t('errorUnexpected'), 401)

    const updatedUser = await updateCurrentUser(tokens.access, { locale })
    setUser(updatedUser)
  }

  async function updateActiveBranch(activeBranch: number) {
    const tokens = readTokens()
    if (!tokens) throw new ApiError(t('errorUnexpected'), 401)

    const updatedUser = await updateCurrentUser(tokens.access, { active_branch: activeBranch })
    setUser(updatedUser)
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
