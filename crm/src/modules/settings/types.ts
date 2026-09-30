export interface City {
  id: number
  name: string
}

export interface OrganizationPhoto {
  id: number
  url: string
}

export interface OrganizationProfile {
  id: number
  name: string
  phone: string
  email: string
  city: number | null
  address: string
  working_days: string
  description: string
  avatar_url: string | null
  photos: OrganizationPhoto[]
}

/**
 * Тело PUT. Картинки уходят списком адресов: уже загруженные — как есть,
 * новые — data URL. Всё, чего нет в `photo_urls`, сервер удаляет.
 */
export type OrganizationProfileInput = Omit<OrganizationProfile, 'id' | 'photos'> & {
  photo_urls: string[]
}
