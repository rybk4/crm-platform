import type { useOrganizationProfile } from '../hooks/useOrganizationProfile'
import type { City, OrganizationProfile } from '../types'

export interface OrganizationSettingsProps {
  profile: OrganizationProfile
  cities: City[]
  update: ReturnType<typeof useOrganizationProfile>['update']
}
