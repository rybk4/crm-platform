import axios, {
  AxiosError,
  type AxiosAdapter,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

import { clearTokens, readTokens, writeTokens } from '../auth/tokenStorage'
import { reportSessionExpired } from '../auth/session'
import { readLocale } from '../i18n/locale'
import { translate } from '../i18n/messages'
import { ApiError } from './ApiError'
import { apiBaseUrl } from './config'
import { parseApiErrors } from './errors'
import {
  isServerUnavailableStatus,
  reportServerAvailable,
  reportServerUnavailable,
} from './serverStatus'
import { transportOverride, type TransportResponse } from './transport'

export const REFRESH_PATH = '/api/auth/token/refresh/'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Публичный эндпоинт: Authorization не подставляем и на 401 не реагируем рефрешем. */
    anonymous?: boolean
    /** Запрос уже повторяли после обновления токена — второй раз не пробуем. */
    retried?: boolean
  }
}

type RetriableConfig = InternalAxiosRequestConfig

interface HttpClientOptions {
  /** Подменяется в тестах, чтобы не ходить в сеть. */
  adapter?: AxiosAdapter
}

function toAxiosResponse(
  result: TransportResponse,
  config: InternalAxiosRequestConfig,
): AxiosResponse {
  const response: AxiosResponse = {
    data: result.data,
    status: result.status,
    statusText: '',
    headers: {},
    config,
  }

  if (result.status >= 200 && result.status < 300) return response

  throw new AxiosError(
    `Request failed with status code ${result.status}`,
    AxiosError.ERR_BAD_RESPONSE,
    config,
    undefined,
    response,
  )
}

/**
 * Адаптер, который сначала спрашивает перехватчик (слой демо-данных), а уже
 * потом идёт в сеть. Без установленного перехватчика ведёт себя как обычный axios.
 */
function createAdapter(fallback?: AxiosAdapter): AxiosAdapter {
  return async (config) => {
    const override = transportOverride()

    if (override) {
      const result = await override({
        method: (config.method ?? 'get').toLowerCase(),
        url: config.url ?? '',
        params: (config.params as Record<string, unknown> | undefined) ?? {},
        body: config.data,
        headers: config.headers.toJSON() as Record<string, string>,
      })

      if (result) return toAxiosResponse(result, config)
    }

    const adapter = fallback ?? axios.getAdapter(axios.defaults.adapter)
    return adapter(config)
  }
}

function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0
  const locale = readLocale()

  if (!error.response) {
    return new ApiError(translate(locale, 'errorConnection'), 0)
  }

  const data = error.response.data
  const messages = parseApiErrors(data)
  const fallback = translate(locale, 'errorServer')

  return new ApiError(messages.join('\n') || fallback, status, data, messages)
}

/**
 * Единая точка входа в бэкенд: подставляет токен и язык, следит за доступностью
 * сервера и сама обновляет протухший access-токен.
 *
 * Прямых вызовов axios за пределами `lib/api` быть не должно — модули работают
 * через наследников `ApiClient`.
 */
export function createApiHttp({ adapter }: HttpClientOptions = {}): AxiosInstance {
  const instance = axios.create({ baseURL: apiBaseUrl, adapter: createAdapter(adapter) })

  // Общий на весь клиент промис обновления: если 401 прилетел сразу по
  // нескольким запросам, рефреш уходит один, остальные ждут его результат.
  let refreshing: Promise<string | null> | null = null

  async function refreshAccessToken(): Promise<string | null> {
    const tokens = readTokens()
    if (!tokens?.refresh) return null

    try {
      const response = await instance.post<{ access: string }>(
        REFRESH_PATH,
        { refresh: tokens.refresh },
        { anonymous: true },
      )
      const access = response.data.access
      writeTokens({ ...tokens, access })
      return access
    } catch {
      return null
    }
  }

  function refreshOnce() {
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null
    })
    return refreshing
  }

  instance.interceptors.request.use((config: RetriableConfig) => {
    config.headers.set('Accept-Language', readLocale())

    if (!config.anonymous) {
      const tokens = readTokens()
      if (tokens?.access) config.headers.set('Authorization', `Bearer ${tokens.access}`)
    }

    return config
  })

  instance.interceptors.response.use(
    (response) => {
      reportServerAvailable()
      return response
    },
    async (error: AxiosError) => {
      if (axios.isCancel(error)) return Promise.reject(error)

      const config = error.config as RetriableConfig | undefined
      const status = error.response?.status ?? 0

      if (isServerUnavailableStatus(status)) {
        reportServerUnavailable()
        return Promise.reject(toApiError(error))
      }

      reportServerAvailable()

      const canRetry = status === 401 && config && !config.retried && !config.anonymous
      if (canRetry) {
        const access = await refreshOnce()
        if (access) {
          config.retried = true
          config.headers.set('Authorization', `Bearer ${access}`)
          return instance.request(config)
        }

        clearTokens()
        reportSessionExpired()
      }

      return Promise.reject(toApiError(error))
    },
  )

  return instance
}

export const apiHttp = createApiHttp()
