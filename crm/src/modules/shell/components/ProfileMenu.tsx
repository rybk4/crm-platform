import { useCallback, useRef } from 'react'

import { useDismissOnOutside } from '@/lib/browser/useDismissOnOutside'

import { useLocale } from '@/lib/i18n/LocaleContext'

import { Avatar } from '@/ui/Avatar'
import { Button } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { useProfileMenu } from '../hooks/useProfileMenu'
import { BranchSwitcher } from './BranchSwitcher'
import { LanguageSwitcher } from './LanguageSwitcher'
import type { ProfileMenuProps } from './ProfileMenu.types'
export type { ProfileMenuProps } from './ProfileMenu.types'

export function ProfileMenu({
  collapsed,
  user,
  onActiveBranchChange,
  onLocaleChange,
  onLogout,
}: ProfileMenuProps) {
  const { t } = useLocale()
  const menu = useProfileMenu({
    activeBranchId: user.active_branch,
    onActiveBranchChange,
    onLocaleChange,
  })

  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeMenu = menu.close
  const dismiss = useCallback(() => {
    closeMenu()
    triggerRef.current?.focus()
  }, [closeMenu])
  const rootRef = useDismissOnOutside<HTMLDivElement>(menu.open, dismiss)

  const displayName = user.name.trim() || user.phone_number
  const avatarValue = user.name.trim().charAt(0).toUpperCase() || 'C'
  const activeBranch = user.active_branch_details

  return (
    <div ref={rootRef} className="sidebar-profile">
      <button
        ref={triggerRef}
        className="sidebar-account"
        type="button"
        aria-label={t('activeBranch')}
        aria-haspopup="dialog"
        aria-expanded={menu.open}
        title={collapsed ? (activeBranch?.name ?? t('selectBranch')) : undefined}
        onClick={menu.toggle}
      >
        <Avatar className="sidebar-account__avatar" label={displayName} value={avatarValue} />
        <span className="sidebar-account__details">
          <strong>{activeBranch?.name ?? t('selectBranch')}</strong>
          <span>{activeBranch?.address ?? t('activeBranch')}</span>
        </span>
        <span className="sidebar-account__chevron" aria-hidden="true" data-open={menu.open}>
          <Icon name="chevron-up" size={18} />
        </span>
      </button>

      {menu.open ? (
        <div className="profile-popover" role="dialog" aria-label={t('profile')}>
          <header className="profile-popover__header">
            <Avatar label={displayName} value={avatarValue} />
            <div>
              <strong>{displayName}</strong>
              <span>{user.phone_number}</span>
            </div>
          </header>

          <BranchSwitcher
            branches={menu.branches}
            activeBranchId={user.active_branch}
            loading={menu.loadingBranches}
            disabled={menu.loadingBranches || menu.savingBranch}
            onSelect={(branchId) => void menu.selectBranch(branchId)}
          />

          <LanguageSwitcher
            disabled={menu.savingLocale}
            onSelect={(item) => void menu.selectLocale(item)}
          />

          <Button
            className="profile-popover__logout"
            kind="quiet"
            startIcon={<Icon name="logout" />}
            onClick={onLogout}
          >
            {t('logout')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
