import { readStoredValue, removeStoredValue, writeStoredValue } from '../browser/storage'

export interface StoredTokens {
  access: string
  refresh: string
}

const storageKey = 'crm.auth.tokens.v1'

function isStoredTokens(value: unknown): value is StoredTokens {
  return (
    typeof value === 'object' &&
    value !== null &&
    'access' in value &&
    'refresh' in value &&
    typeof value.access === 'string' &&
    typeof value.refresh === 'string'
  )
}

export function readTokens(): StoredTokens | null {
  const raw = readStoredValue(storageKey)
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    return isStoredTokens(parsed) ? { access: parsed.access, refresh: parsed.refresh } : null
  } catch {
    return null
  }
}

export function writeTokens(tokens: StoredTokens) {
  writeStoredValue(storageKey, JSON.stringify(tokens))
}

export function clearTokens() {
  removeStoredValue(storageKey)
}
