import { describe, expect, it } from 'vitest'

import {
  emptySettingsForm,
  formToInput,
  isSettingsFormDirty,
  isSupportedImage,
  profileToForm,
  validateSettingsForm,
} from '../model'
import type { OrganizationProfile } from '../types'

const profile: OrganizationProfile = {
  id: 1,
  name: 'Лаванда',
  phone: '+77051234567',
  email: 'hello@lavanda.kz',
  city: 2,
  address: 'Абая, 44',
  working_days: 'Пн–Сб',
  description: 'Студия',
  avatar_url: null,
  photos: [{ id: 5, url: 'https://cdn/a.jpg' }],
}

describe('profileToForm', () => {
  it('раскладывает телефон в маску, город — в строку, фото — в адреса', () => {
    const form = profileToForm(profile)

    expect(form.phone).toBe('+7 (705) 123-45-67')
    expect(form.city).toBe('2')
    expect(form.photo_urls).toEqual(['https://cdn/a.jpg'])
  })

  it('пустой город превращает в пустую строку', () => {
    expect(profileToForm({ ...profile, city: null }).city).toBe('')
  })
})

describe('formToInput', () => {
  it('нормализует телефон, обрезает пробелы и переводит город в число', () => {
    const input = formToInput({ ...profileToForm(profile), name: '  Лаванда  ' })

    expect(input.phone).toBe('+77051234567')
    expect(input.name).toBe('Лаванда')
    expect(input.city).toBe(2)
  })

  it('без выбранного города отправляет null', () => {
    expect(formToInput(emptySettingsForm()).city).toBeNull()
  })
})

describe('validateSettingsForm', () => {
  it('требует название и телефон', () => {
    expect(validateSettingsForm(emptySettingsForm())).toEqual({
      name: 'settingsErrorRequired',
      phone: 'settingsErrorRequired',
    })
  })

  it('проверяет формат телефона и почты', () => {
    const form = { ...profileToForm(profile), phone: '+7 (705) 12', email: 'not-an-email' }

    expect(validateSettingsForm(form)).toEqual({
      phone: 'errorPhoneFormat',
      email: 'settingsErrorEmail',
    })
  })

  it('пропускает заполненную форму и пустую почту', () => {
    expect(validateSettingsForm({ ...profileToForm(profile), email: '' })).toEqual({})
  })
})

describe('isSettingsFormDirty', () => {
  it('не считает изменением пробелы по краям', () => {
    const initial = profileToForm(profile)

    expect(isSettingsFormDirty({ ...initial, address: ' Абая, 44 ' }, initial)).toBe(false)
  })

  it('замечает удалённое фото и новый логотип', () => {
    const initial = profileToForm(profile)

    expect(isSettingsFormDirty({ ...initial, photo_urls: [] }, initial)).toBe(true)
    expect(isSettingsFormDirty({ ...initial, avatar_url: 'data:image/png;base64,' }, initial)).toBe(
      true,
    )
  })
})

describe('isSupportedImage', () => {
  it('принимает JPG и PNG', () => {
    expect(isSupportedImage({ name: 'logo.PNG', type: 'image/png' })).toBe(true)
    expect(isSupportedImage({ name: 'hall.jpeg', type: 'image/jpeg' })).toBe(true)
  })

  it('отклоняет другой тип или расширение', () => {
    expect(isSupportedImage({ name: 'logo.gif', type: 'image/gif' })).toBe(false)
    expect(isSupportedImage({ name: 'logo.png', type: 'image/webp' })).toBe(false)
  })
})
