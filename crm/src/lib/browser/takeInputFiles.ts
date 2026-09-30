import type { ChangeEvent } from 'react'

/** Забирает выбранные файлы и очищает input, чтобы тот же файл можно было выбрать снова. */
export function takeFiles(event: ChangeEvent<HTMLInputElement>) {
  const files = Array.from(event.target.files ?? [])
  event.target.value = ''
  return files
}
