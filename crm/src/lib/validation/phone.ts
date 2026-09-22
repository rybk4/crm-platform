const phonePattern = /^\+[1-9]\d{7,14}$/

export function normalizePhone(value: string) {
  const compact = value.trim().replace(/[^\d+]/g, '')

  if (/^8\d{10}$/.test(compact)) {
    return `+7${compact.slice(1)}`
  }
  if (/^7\d{10}$/.test(compact)) {
    return `+${compact}`
  }
  return compact
}

export function formatPhoneInput(value: string) {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`
  if (!digits.startsWith('7')) digits = `7${digits}`

  const nationalNumber = digits.slice(1, 11)
  let formatted = '+7'

  if (nationalNumber.length > 0) formatted += ` (${nationalNumber.slice(0, 3)}`
  if (nationalNumber.length >= 3) formatted += ')'
  if (nationalNumber.length > 3) formatted += ` ${nationalNumber.slice(3, 6)}`
  if (nationalNumber.length > 6) formatted += `-${nationalNumber.slice(6, 8)}`
  if (nationalNumber.length > 8) formatted += `-${nationalNumber.slice(8, 10)}`

  return formatted
}

export function isValidPhone(value: string) {
  return phonePattern.test(value)
}
