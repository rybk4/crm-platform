import { setDemoMode } from '@/lib/api/demoMode'
import { setTransportOverride, type TransportRequest } from '@/lib/api/transport'
import { mockRoutes } from './handlers'
import { matchRoute } from './router'

const DEFAULT_LATENCY_MS = 160

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** До адаптера axios успевает сериализовать тело — разбираем его обратно. */
function parseBody(body: unknown): Record<string, unknown> {
  if (typeof body === 'string') {
    try {
      const parsed: unknown = JSON.parse(body)
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
    } catch {
      return {}
    }
  }

  return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
}

function toQuery(params: Record<string, unknown>) {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  )

  return Object.fromEntries(entries.map(([key, value]) => [key, String(value)]))
}

function pathOf(url: string) {
  try {
    return new URL(url, 'http://demo.local').pathname
  } catch {
    return url
  }
}

interface InstallOptions {
  latencyMs?: number
}

/**
 * Включает встроенный набор данных: запросы к известным адресам получают ответ
 * без сети, остальные уходят на сервер как обычно.
 *
 * Весь демо-режим живёт в `src/mocks` — удалите папку и вызов из `main.tsx`,
 * и приложение будет работать только с настоящим бэкендом.
 */
export function installMockApi({ latencyMs = DEFAULT_LATENCY_MS }: InstallOptions = {}) {
  setDemoMode(true)

  setTransportOverride(async (request: TransportRequest) => {
    const matched = matchRoute(mockRoutes, request.method, pathOf(request.url))
    if (!matched) return null

    if (latencyMs > 0) await delay(latencyMs)

    return matched.route.handle({
      params: matched.params,
      query: toQuery(request.params),
      body: parseBody(request.body),
    })
  })
}

export function uninstallMockApi() {
  setTransportOverride(null)
  setDemoMode(false)
}
