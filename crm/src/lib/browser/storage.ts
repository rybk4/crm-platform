/**
 * Доступ к localStorage, переживающий приватный режим и запрет на хранение
 * данных: там любое обращение к хранилищу бросает исключение.
 *
 * Ключи именуются как `crm.<домен>.v<версия>` — версия позволяет поменять
 * формат значения, не читая чужие старые данные.
 */

export function readStoredValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStoredValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Хранилище недоступно — настройка просто не переживёт перезагрузку.
  }
}

export function removeStoredValue(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // См. writeStoredValue.
  }
}
