import type { AuthUser } from '@/modules/auth/types'
import type { EntityId } from '@/lib/api/entityId'
import type { Locale } from '@/lib/i18n/locale'

export interface AppShellProps {
  user: AuthUser
  onActiveBranchChange: (branchId: EntityId) => Promise<void>
  onLocaleChange: (locale: Locale) => Promise<void>
  onLogout: () => void
}
