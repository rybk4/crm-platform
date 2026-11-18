import { describe, expect, it } from 'vitest'

import { deletePhoneEdit, formatPhoneEdit, phoneCaret } from '../phoneEditing'

const phone = '+7 (700) 123-45-67'

describe('phone editing', () => {
  it('formats local, national and pasted international numbers', () => {
    for (const raw of ['7001234567', '87001234567', '+7 (700) 123-45-67']) {
      expect(formatPhoneEdit(raw, raw.length)).toEqual({ value: phone, cursor: phone.length })
    }
    expect(formatPhoneEdit('8', 1)).toEqual({ value: '+7', cursor: 2 })
    expect(formatPhoneEdit('', 0)).toEqual({ value: '', cursor: 0 })
  })

  it('preserves the caret when editing in the middle and filters letters', () => {
    expect(formatPhoneEdit('+7 (7900) 123-45-67', 6).cursor).toBe(6)
    expect(formatPhoneEdit('abc', 3)).toEqual({ value: '', cursor: 0 })
    expect(phoneCaret(phone, 30)).toBe(phone.length)
    expect(phoneCaret(phone, 0)).toBe(0)
  })

  it('backspaces across parentheses, spaces and hyphens', () => {
    expect(deletePhoneEdit('+7 (700)', 8, 8, true).value).toBe('+7 (70')
    expect(deletePhoneEdit('+7 (700) 123-', 12, 12, true).value).toBe('+7 (700) 12')
    expect(deletePhoneEdit(phone, 15, 15, true).value).toBe('+7 (700) 123-46-7')
  })

  it('deletes forward over separators without moving to the end', () => {
    expect(deletePhoneEdit(phone, 7, 7, false)).toEqual({ value: '+7 (700) 234-56-7', cursor: 7 })
  })

  it('deletes a selection, clears the field and removes the final national digit', () => {
    expect(deletePhoneEdit(phone, 4, 7, true)).toEqual({ value: '+7 (123) 456-7', cursor: 2 })
    expect(deletePhoneEdit(phone, 0, phone.length, true)).toEqual({ value: '', cursor: 0 })
    expect(deletePhoneEdit('+7 (7', 5, 5, true)).toEqual({ value: '', cursor: 0 })
    expect(deletePhoneEdit('+7', 2, 2, true)).toEqual({ value: '', cursor: 0 })
  })
})
