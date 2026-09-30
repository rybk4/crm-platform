import type { OrganizationProfile, OrganizationProfileInput } from '@/modules/settings/types'
import { cities, organizationProfile } from '../fixtures/organizationProfile'
import { ok, route } from '../router'

let profile: OrganizationProfile = {
  ...organizationProfile,
  photos: organizationProfile.photos.map((photo) => ({ ...photo })),
}

/** Как сделал бы сервер: оставленные адреса сохраняют id, новые получают следующий. */
function toProfile(input: OrganizationProfileInput): OrganizationProfile {
  let nextPhotoId = profile.photos.reduce((max, photo) => Math.max(max, photo.id), 0)
  const { photo_urls: photoUrls, ...fields } = input
  const photos = photoUrls.map(
    (url) => profile.photos.find((photo) => photo.url === url) ?? { id: ++nextPhotoId, url },
  )

  return { ...fields, id: profile.id, photos }
}

export const settingsRoutes = [
  route('get', '/api/organization/profile/', () => ok(profile)),
  route('put', '/api/organization/profile/', ({ body }) => {
    profile = toProfile(body as unknown as OrganizationProfileInput)
    return ok(profile)
  }),
  route('get', '/api/cities/', () => ok(cities)),
]
