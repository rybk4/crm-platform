import { describe, expect, it } from 'vitest'

import { readFileAsDataUrl } from './readFileAsDataUrl'

describe('readFileAsDataUrl', () => {
  it('возвращает data URL с типом файла', async () => {
    const file = new File(['hi'], 'a.png', { type: 'image/png' })

    await expect(readFileAsDataUrl(file)).resolves.toBe('data:image/png;base64,aGk=')
  })
})
