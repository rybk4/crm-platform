import { ApiError } from './ApiError'

/**
 * Достаёт из ошибки текст для пользователя: у ApiError это разобранные
 * сообщения бэкенда, у всего остального — общий запасной текст.
 */
export function apiErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}
