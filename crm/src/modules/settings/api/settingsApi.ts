import { ApiClient } from '@/lib/api/ApiClient'
import type { City, OrganizationProfile, OrganizationProfileInput } from '../types'

class SettingsApi extends ApiClient {
  constructor() {
    super('/api/')
  }

  profile(options?: { signal?: AbortSignal }) {
    return this.get<OrganizationProfile>('organization/profile/', options)
  }

  updateProfile(input: OrganizationProfileInput) {
    return this.put<OrganizationProfile>('organization/profile/', input)
  }

  cities(options?: { signal?: AbortSignal }) {
    return this.get<City[]>('cities/', options)
  }
}

export const settingsApi = new SettingsApi()
