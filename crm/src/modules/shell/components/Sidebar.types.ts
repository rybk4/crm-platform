import type { EntityId } from '@/lib/api/entityId'
import type { Locale } from '@/lib/i18n/locale'
import type { AuthUser } from '@/modules/auth/types'

export interface SidebarProps {
  collapsed: boolean
  mobile: boolean
  open: boolean
  user: AuthUser
  onActiveBranchChange: (branchId: EntityId) => Promise<void>
  onClose: () => void
  onLocaleChange: (locale: Locale) => Promise<void>
  onLogout: () => void
  onToggleCollapsed: () => void
}
