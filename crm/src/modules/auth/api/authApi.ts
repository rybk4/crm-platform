import { ApiClient } from '@/lib/api/ApiClient'
import type { Locale } from '@/lib/i18n/locale'
import type { AuthUser, LoginResponse, OtpRequestResponse, ProfileChanges } from '../types'

class AuthApi extends ApiClient {
  constructor() {
    super('/api/')
  }

  requestOtp(phoneNumber: string) {
    return this.post<OtpRequestResponse>(
      'auth/otp/request/',
      { phone_number: phoneNumber },
      { anonymous: true },
    )
  }

  verifyOtp(phoneNumber: string, code: string) {
    return this.post<LoginResponse>(
      'auth/otp/verify/',
      { phone_number: phoneNumber, code },
      { anonymous: true },
    )
  }

  getCurrentUser(options?: { signal?: AbortSignal }) {
    return this.get<AuthUser>('users/me/', options)
  }

  updateCurrentUser(changes: ProfileChanges) {
    return this.patch<AuthUser>('users/me/', changes)
  }

  updateLocale(locale: Locale) {
    return this.updateCurrentUser({ locale })
  }

  updateActiveBranch(activeBranch: number | null) {
    return this.updateCurrentUser({ active_branch: activeBranch })
  }
}

export const authApi = new AuthApi()
