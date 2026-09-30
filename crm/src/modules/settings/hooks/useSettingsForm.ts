import { useMemo, useState } from 'react'

import { readFileAsDataUrl } from '@/lib/browser/readFileAsDataUrl'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { notifications } from '@/lib/toast/notifications'
import { formatPhoneInput } from '@/lib/validation/phone'
import {
  formToInput,
  isSettingsFormDirty,
  isSupportedImage,
  profileToForm,
  validateSettingsForm,
} from '../model'
import type { SettingsErrors, SettingsTextField } from '../model'
import type { OrganizationProfile } from '../types'
import type { useOrganizationProfile } from './useOrganizationProfile'

interface UseSettingsFormOptions {
  profile: OrganizationProfile
  update: Pick<ReturnType<typeof useOrganizationProfile>['update'], 'mutateAsync' | 'isPending'>
}

/** Черновик настроек организации: правки полей, картинки, проверка и отправка. */
export function useSettingsForm({ profile, update }: UseSettingsFormOptions) {
  const { t } = useLocale()
  const initial = useMemo(() => profileToForm(profile), [profile])
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<SettingsErrors>({})

  function patch(field: SettingsTextField, value: string) {
    const next = field === 'phone' ? formatPhoneInput(value) : value
    setForm((current) => ({ ...current, [field]: next }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function readImages(files: readonly File[]) {
    if (files.some((file) => !isSupportedImage(file))) {
      notifications.error(t('settingsUnsupportedImage'))
      return null
    }
    return Promise.all(files.map(readFileAsDataUrl))
  }

  async function pickAvatar(file: File) {
    const [url] = (await readImages([file])) ?? []
    if (url) setForm((current) => ({ ...current, avatar_url: url }))
  }

  function removeAvatar() {
    setForm((current) => ({ ...current, avatar_url: null }))
  }

  async function addPhotos(files: readonly File[]) {
    const urls = await readImages(files)
    if (urls?.length) {
      // Один и тот же файл, выбранный дважды, не дублируем: адрес — ключ фотографии.
      setForm((current) => ({
        ...current,
        photo_urls: [...new Set([...current.photo_urls, ...urls])],
      }))
    }
  }

  function removePhoto(url: string) {
    setForm((current) => ({
      ...current,
      photo_urls: current.photo_urls.filter((item) => item !== url),
    }))
  }

  function reset() {
    setForm(initial)
    setErrors({})
  }

  async function submit() {
    const nextErrors = validateSettingsForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      const saved = await update.mutateAsync(formToInput(form))
      setForm(profileToForm(saved))
    } catch {
      // Сообщение уже показала мутация — черновик остаётся на экране.
    }
  }

  return {
    form,
    errors,
    dirty: isSettingsFormDirty(form, initial),
    saving: update.isPending,
    patch,
    pickAvatar,
    removeAvatar,
    addPhotos,
    removePhoto,
    reset,
    submit,
  }
}
