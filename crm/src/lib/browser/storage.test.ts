import { afterEach, describe, expect, it, vi } from 'vitest'

import { readStoredValue, removeStoredValue, writeStoredValue } from './storage'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('storage', () => {
  it('пишет и читает значение', () => {
    writeStoredValue('crm.test.v1', 'значение')

    expect(readStoredValue('crm.test.v1')).toBe('значение')
  })

  it('на отсутствующем ключе отдаёт null', () => {
    expect(readStoredValue('crm.missing.v1')).toBeNull()
  })

  it('удаляет значение', () => {
    writeStoredValue('crm.test.v1', 'значение')
    removeStoredValue('crm.test.v1')

    expect(readStoredValue('crm.test.v1')).toBeNull()
  })

  it('не падает, когда хранилище запрещено', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    expect(() => writeStoredValue('crm.test.v1', 'x')).not.toThrow()
    expect(readStoredValue('crm.test.v1')).toBeNull()
    expect(() => removeStoredValue('crm.test.v1')).not.toThrow()
  })
})
