import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  checkServerHealth,
  getServerStatus,
  reportServerAvailable,
  subscribeServerStatus,
} from '@/lib/api/serverStatus'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { notifications } from '@/lib/toast/notifications'

const RETRY_INTERVAL_MS = 5000

/**
 * Держит признак недоступности сервера: поднимается из http-слоя при сетевой
 * ошибке или 5xx, снимается, когда /api/health/ снова отвечает.
 */
export function useServerStatus() {
  const { t } = useLocale()
  const queryClient = useQueryClient()
  const [unavailable, setUnavailable] = useState(() => getServerStatus() === 'unavailable')
  const [checking, setChecking] = useState(false)
  const wasUnavailable = useRef(unavailable)

  useEffect(() => subscribeServerStatus((status) => setUnavailable(status === 'unavailable')), [])

  const check = useCallback(async (signal?: AbortSignal) => {
    setChecking(true)
    try {
      const healthy = await checkServerHealth(signal)
      if (healthy) reportServerAvailable()
      return healthy
    } finally {
      if (!signal?.aborted) setChecking(false)
    }
  }, [])

  useEffect(() => {
    if (!unavailable) return

    const controller = new AbortController()
    const run = () => void check(controller.signal)
    // Первая проверка — сразу, но отдельной задачей: недоступность мог поднять
    // единичный сбой, а синхронный setState прямо в эффекте даёт лишний рендер.
    const immediate = setTimeout(run, 0)
    const interval = setInterval(run, RETRY_INTERVAL_MS)

    return () => {
      controller.abort()
      clearTimeout(immediate)
      clearInterval(interval)
    }
  }, [unavailable, check])

  useEffect(() => {
    if (wasUnavailable.current && !unavailable) {
      notifications.success(t('serverRestored'))
      void queryClient.invalidateQueries()
    }
    wasUnavailable.current = unavailable
  }, [unavailable, queryClient, t])

  const retry = useCallback(() => void check(), [check])

  return { unavailable, checking, retry }
}
