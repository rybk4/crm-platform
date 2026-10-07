import type { EntityId } from '@/lib/api/entityId'
import type { Locale } from '@/lib/i18n/locale'
import type { AuthUser } from '@/modules/auth/types'

export interface ProfileMenuProps {
  collapsed: boolean
  user: AuthUser
  onActiveBranchChange: (branchId: EntityId) => Promise<void>
  onLocaleChange: (locale: Locale) => Promise<void>
  onLogout: () => void
}
