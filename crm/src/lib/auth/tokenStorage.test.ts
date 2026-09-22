import { afterEach, describe, expect, it } from 'vitest'

import { clearTokens, readTokens, writeTokens } from './tokenStorage'

afterEach(() => {
  localStorage.clear()
})

describe('tokenStorage', () => {
  it('сохраняет и читает пару токенов', () => {
    writeTokens({ access: 'a', refresh: 'r' })

    expect(readTokens()).toEqual({ access: 'a', refresh: 'r' })
  })

  it('без сохранённых токенов отдаёт null', () => {
    expect(readTokens()).toBeNull()
  })

  it('отбрасывает битый JSON', () => {
    localStorage.setItem('crm.auth.tokens.v1', 'не json')

    expect(readTokens()).toBeNull()
  })

  it('отбрасывает значение неверной формы', () => {
    localStorage.setItem('crm.auth.tokens.v1', JSON.stringify({ access: 1, refresh: null }))

    expect(readTokens()).toBeNull()
  })

  it('очищает токены', () => {
    writeTokens({ access: 'a', refresh: 'r' })
    clearTokens()

    expect(readTokens()).toBeNull()
  })
})
