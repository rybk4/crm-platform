export interface StoredTokens {
  access: string
  refresh: string
}

const storageKey = 'crm.auth.tokens.v1'

export function readTokens(): StoredTokens | null {
  try {
    const value = localStorage.getItem(storageKey)
    if (!value) return null

    const parsed: unknown = JSON.parse(value)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'access' in parsed &&
      'refresh' in parsed &&
      typeof parsed.access === 'string' &&
      typeof parsed.refresh === 'string'
    ) {
      return { access: parsed.access, refresh: parsed.refresh }
    }
  } catch {
    return null
  }

  return null
}

export function writeTokens(tokens: StoredTokens) {
  localStorage.setItem(storageKey, JSON.stringify(tokens))
}

export function clearTokens() {
  localStorage.removeItem(storageKey)
}

