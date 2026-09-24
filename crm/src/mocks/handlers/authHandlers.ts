import type { Locale } from '@/lib/i18n/locale'
import { db, refreshDerived } from '../db'
import { demoUser } from '../fixtures/user'
import { badRequest, ok, route } from '../router'

const session = { user: { ...demoUser } }

export function currentUser() {
  return session.user
}

export const authRoutes = [
  route('post', '/api/auth/otp/request/', ({ body }) => {
    if (!body.phone_number) return badRequest({ phone_number: ['Введите номер телефона.'] })

    return ok({
      detail: 'Код отправлен.',
      debug: '0000',
      user_exists: true,
    })
  }),

  route('post', '/api/auth/otp/verify/', ({ body }) => {
    if (!body.code) return badRequest({ code: ['Введите код подтверждения.'] })

    session.user = { ...demoUser, phone_number: String(body.phone_number ?? demoUser.phone_number) }

    return ok({
      access: 'demo-access-token',
      refresh: 'demo-refresh-token',
      user: session.user,
      created: false,
      detail: 'Вход выполнен.',
    })
  }),

  route('post', '/api/auth/token/refresh/', () => ok({ access: 'demo-access-token' })),

  route('get', '/api/users/me/', () => ok(session.user)),

  route('patch', '/api/users/me/', ({ body }) => {
    if (typeof body.locale === 'string') session.user.locale = body.locale as Locale

    if ('active_branch' in body) {
      const branchId = Number(body.active_branch)
      const branch = db.branches.find((item) => item.id === branchId)

      session.user.active_branch = branch?.id ?? null
      session.user.active_branch_details = branch
        ? {
            id: branch.id,
            name: branch.name,
            address: branch.address,
            organization: branch.organization,
            organization_name: branch.organization_name,
          }
        : null
    }

    if (typeof body.name === 'string') session.user.name = body.name

    refreshDerived()
    return ok(session.user)
  }),
]
