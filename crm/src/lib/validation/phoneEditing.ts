import { formatPhoneInput } from './phone'

/** Position immediately after the requested digit, independent of mask separators. */
export function phoneCaret(value: string, digitCount: number) {
  if (digitCount <= 0) return 0
  let count = 0
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index]) && ++count === digitCount) return index + 1
  }
  return value.length
}

export function formatPhoneEdit(raw: string, cursor: number) {
  const digits = raw.replace(/\D/g, '')
  if (raw === '8') return { value: '+7', cursor: 2 }
  const local = !raw.trimStart().startsWith('+') && digits.length <= 10
  const value = digits ? formatPhoneInput(local ? `7${digits}` : raw) : ''
  const addedPrefix = local || (digits && !/^[78]/.test(digits)) ? 1 : 0
  const before = raw.slice(0, cursor).replace(/\D/g, '').length
  return { value, cursor: phoneCaret(value, before + addedPrefix) }
}

/** Delete digits rather than decorative spaces, parentheses or dashes. */
export function deletePhoneEdit(value: string, start: number, end: number, backward: boolean) {
  const digits = value.replace(/\D/g, '')
  let from = value.slice(0, start).replace(/\D/g, '').length
  let to = value.slice(0, end).replace(/\D/g, '').length
  if (start === 0 && end === value.length) return { value: '', cursor: 0 }
  if (start === end) {
    if (backward) from -= 1
    else to += 1
  }
  // The country code stays fixed until the entire field is cleared.
  from = Math.max(1, from)
  to = Math.max(from, to)
  const next = digits.slice(0, from) + digits.slice(to)
  const formatted = next.length <= 1 ? '' : formatPhoneInput(next)
  return { value: formatted, cursor: phoneCaret(formatted, from) }
}
