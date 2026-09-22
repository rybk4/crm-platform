import { apiBaseUrl } from './config'

export type ServerStatus = 'available' | 'unavailable'

type Listener = (status: ServerStatus) => void

const listeners = new Set<Listener>()
let currentStatus: ServerStatus = 'available'

/** Статусы, при которых сервер не смог обслужить запрос как сервис, а не как API. */
const unavailableStatuses = [502, 503, 504]

export function isServerUnavailableStatus(status: number) {
  return status === 0 || unavailableStatuses.includes(status)
}

export function getServerStatus() {
  return currentStatus
}

function setServerStatus(status: ServerStatus) {
  if (status === currentStatus) return
  currentStatus = status
  listeners.forEach((listener) => listener(status))
}

export function reportServerUnavailable() {
  setServerStatus('unavailable')
}

export function reportServerAvailable() {
  setServerStatus('available')
}

export function subscribeServerStatus(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Опрашивает /api/health/ напрямую, минуя httpRequest: этот запрос не должен
 * сам поднимать флаг недоступности, иначе проверка восстановления зациклится.
 */
export async function checkServerHealth(signal?: AbortSignal) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/health/`, { cache: 'no-store', signal })
    return response.ok
  } catch {
    return false
  }
}

/** Только для тестов: сбрасывает состояние модуля между кейсами. */
export function resetServerStatus() {
  currentStatus = 'available'
  listeners.clear()
}
