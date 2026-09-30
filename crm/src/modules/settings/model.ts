import type { TranslationKey } from '@/lib/i18n/messages'
import { formatPhoneInput, isValidPhone, normalizePhone } from '@/lib/validation/phone'
import type { OrganizationProfile, OrganizationProfileInput } from './types'

/** Состояние формы: телефон — в маске ввода, город — строкой для выпадающего списка. */
export interface SettingsForm {
  name: string
  phone: string
  email: string
  city: string
  address: string
  working_days: string
  description: string
  avatar_url: string | null
  photo_urls: string[]
}

export type SettingsTextField = Exclude<keyof SettingsForm, 'avatar_url' | 'photo_urls'>

export type SettingsErrors = Partial<Record<SettingsTextField, TranslationKey>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const supportedImageTypes = ['image/jpeg', 'image/png']
const supportedImageExtensions = ['.jpg', '.jpeg', '.png']

export const supportedImageAccept = supportedImageExtensions.join(',')

export function emptySettingsForm(): SettingsForm {
  return {
    name: '',
    phone: formatPhoneInput(''),
    email: '',
    city: '',
    address: '',
    working_days: '',
    description: '',
    avatar_url: null,
    photo_urls: [],
  }
}

export function profileToForm(profile: OrganizationProfile): SettingsForm {
  return {
    name: profile.name,
    phone: formatPhoneInput(profile.phone),
    email: profile.email,
    city: profile.city === null ? '' : String(profile.city),
    address: profile.address,
    working_days: profile.working_days,
    description: profile.description,
    avatar_url: profile.avatar_url,
    photo_urls: profile.photos.map((photo) => photo.url),
  }
}

export function formToInput(form: SettingsForm): OrganizationProfileInput {
  return {
    name: form.name.trim(),
    phone: normalizePhone(form.phone),
    email: form.email.trim(),
    city: form.city ? Number(form.city) : null,
    address: form.address.trim(),
    working_days: form.working_days.trim(),
    description: form.description.trim(),
    avatar_url: form.avatar_url,
    photo_urls: form.photo_urls,
  }
}

export function validateSettingsForm(form: SettingsForm): SettingsErrors {
  const errors: SettingsErrors = {}
  const phone = normalizePhone(form.phone)

  if (!form.name.trim()) errors.name = 'settingsErrorRequired'
  if (phone === '+7') errors.phone = 'settingsErrorRequired'
  else if (!isValidPhone(phone)) errors.phone = 'errorPhoneFormat'
  if (form.email.trim() && !emailPattern.test(form.email.trim()))
    errors.email = 'settingsErrorEmail'

  return errors
}

export function isSettingsFormDirty(form: SettingsForm, initial: SettingsForm) {
  return JSON.stringify(formToInput(form)) !== JSON.stringify(formToInput(initial))
}

export function isSupportedImage(file: Pick<File, 'name' | 'type'>) {
  const name = file.name.toLowerCase()
  const extension = name.slice(name.lastIndexOf('.'))

  return supportedImageTypes.includes(file.type) && supportedImageExtensions.includes(extension)
}
