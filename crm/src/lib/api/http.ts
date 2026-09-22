import { readLocale } from '../i18n/locale'
import { translate } from '../i18n/messages'
import { parseApiErrors } from './errors'
import { readTokens } from '../auth/tokenStorage'

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly details: unknown
  readonly messages: readonly string[]

  constructor(message: string, status: number, details: unknown = null, messages = [message]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.messages = messages
  }
}

export async function httpRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Accept-Language')) headers.set('Accept-Language', readLocale())

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError(translate(readLocale(), 'errorConnection'), 0)
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const messages = parseApiErrors(data)
    const fallbackMessage = translate(readLocale(), 'errorServer')
    throw new ApiError(messages.join('\n') || fallbackMessage, response.status, data, messages)
  }

  return data as T
}

export function authenticatedRequest<T>(path: string, options: RequestInit = {}) {
  const tokens = readTokens()
  const headers = new Headers(options.headers)
  if (tokens?.access) headers.set('Authorization', `Bearer ${tokens.access}`)
  return httpRequest<T>(path, { ...options, headers })
}
