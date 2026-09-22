import type { Locale } from '../../lib/i18n/locale'

export interface ActiveBranchDetails {
  id: number
  name: string
  address: string
  organization: number
  organization_name: string
}

export interface AuthUser {
  id: number
  name: string
  phone_number: string
  locale: Locale
  active_branch: number | null
  active_branch_details: ActiveBranchDetails | null
  is_staff: boolean
  date_joined: string
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
