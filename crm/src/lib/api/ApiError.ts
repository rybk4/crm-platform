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

  /** Сервер ответил, но отказал в доступе: токен протух или его не приняли. */
  get isUnauthorized() {
    return this.status === 401
  }

  /** Сеть или шлюз: запрос не дошёл до приложения, повтор имеет смысл. */
  get isServerUnavailable() {
    return this.status === 0 || this.status === 502 || this.status === 503 || this.status === 504
  }
}
