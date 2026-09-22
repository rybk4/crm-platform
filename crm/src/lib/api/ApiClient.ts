import type { AxiosInstance } from 'axios'

import { apiHttp } from './httpClient'

export interface RequestOptions {
  /** Публичный эндпоинт: не подставлять Authorization и не пытаться обновить токен. */
  anonymous?: boolean
  /** Query-параметры; undefined-значения не уходят в запрос. */
  params?: Record<string, string | number | boolean | undefined>
  signal?: AbortSignal
}

function joinPath(basePath: string, path: string) {
  if (!path) return basePath
  return `${basePath.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

/**
 * База для всех API модулей. Наследник объявляет свой базовый путь и методы
 * предметной области — сеть, токены, язык и ошибки уже обеспечены клиентом.
 *
 * ```ts
 * class SpecialistsApi extends ApiClient {
 *   constructor() {
 *     super('/api/specialists/')
 *   }
 *
 *   list() {
 *     return this.get<Specialist[]>()
 *   }
 * }
 * ```
 */
export abstract class ApiClient {
  private readonly basePath: string
  private readonly http: AxiosInstance

  protected constructor(basePath: string, http: AxiosInstance = apiHttp) {
    this.basePath = basePath
    this.http = http
  }

  protected async get<T>(path = '', options: RequestOptions = {}) {
    const response = await this.http.get<T>(joinPath(this.basePath, path), options)
    return response.data
  }

  protected async post<T>(path = '', body?: unknown, options: RequestOptions = {}) {
    const response = await this.http.post<T>(joinPath(this.basePath, path), body, options)
    return response.data
  }

  protected async put<T>(path = '', body?: unknown, options: RequestOptions = {}) {
    const response = await this.http.put<T>(joinPath(this.basePath, path), body, options)
    return response.data
  }

  protected async patch<T>(path = '', body?: unknown, options: RequestOptions = {}) {
    const response = await this.http.patch<T>(joinPath(this.basePath, path), body, options)
    return response.data
  }

  protected async delete<T = void>(path = '', options: RequestOptions = {}) {
    const response = await this.http.delete<T>(joinPath(this.basePath, path), options)
    return response.data
  }
}
