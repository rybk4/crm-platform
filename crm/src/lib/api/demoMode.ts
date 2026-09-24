/**
 * Признак того, что данные приходят не с сервера, а из встроенного набора.
 * Интерфейс показывает по нему отметку «Демо-данные»; кто именно поднял флаг,
 * приложению не важно.
 */
let demoMode = false

export function setDemoMode(enabled: boolean) {
  demoMode = enabled
}

export function isDemoMode() {
  return demoMode
}
