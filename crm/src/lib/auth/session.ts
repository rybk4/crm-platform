type Listener = () => void

const listeners = new Set<Listener>()

/**
 * Сообщает приложению, что сессия больше не действительна: рефреш не удался и
 * токены очищены. Подписан слой авторизации — он переводит пользователя на вход.
 */
export function reportSessionExpired() {
  listeners.forEach((listener) => listener())
}

export function subscribeSessionExpired(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Только для тестов: снимает всех подписчиков между кейсами. */
export function resetSessionListeners() {
  listeners.clear()
}
