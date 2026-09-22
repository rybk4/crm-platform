import { httpRequest } from '../../../lib/api/http'
import type { StoredTokens } from '../../../lib/auth/tokenStorage'
import type { AuthUser, LoginResponse, OtpRequestResponse } from '../types'
import type { Locale } from '../../../lib/i18n/locale'

export function requestOtp(phoneNumber: string) {
  return httpRequest<OtpRequestResponse>('/api/auth/otp/request/', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phoneNumber }),
  })
}

export function verifyOtp(phoneNumber: string, code: string) {
  return httpRequest<LoginResponse>('/api/auth/otp/verify/', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phoneNumber, code }),
  })
}

export function getCurrentUser(accessToken: string) {
  return httpRequest<AuthUser>('/api/users/me/', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function updateCurrentUser(accessToken: string, changes: { locale?: Locale; name?: string; active_branch?: number | null }) {
  return httpRequest<AuthUser>('/api/users/me/', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(changes),
  })
}

export function refreshAccessToken(refreshToken: string) {
  return httpRequest<Pick<StoredTokens, 'access'>>('/api/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken }),
  })
}
