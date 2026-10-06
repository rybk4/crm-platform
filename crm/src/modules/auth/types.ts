import type { Locale } from '@/lib/i18n/locale'
import type { EntityId } from '@/lib/api/entityId'

export interface ActiveBranchDetails {
  id: EntityId
  name: string
  address: string
  organization: EntityId
  organization_name: string
}

export interface AuthUser {
  id: EntityId
  name: string
  phone_number: string
  locale: Locale
  active_branch: EntityId | null
  active_branch_details: ActiveBranchDetails | null
  is_staff: boolean
  date_joined: string
  subscription_started_at?: string | null
  subscription_expires_at?: string | null
}

export interface ProfileChanges {
  locale?: Locale
  name?: string
  active_branch?: EntityId | null
}

export interface OtpRequestResponse {
  detail: string
  debug?: string
  user_exists: boolean
}

export interface LoginResponse {
  access: string
  refresh: string
  user: AuthUser
  created: boolean
  detail: string
}
