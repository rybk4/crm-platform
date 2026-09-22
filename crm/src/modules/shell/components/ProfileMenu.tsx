import { useCallback, useRef } from 'react'

import { useDismissOnOutside } from '@/lib/browser/useDismissOnOutside'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { supportedLocales, type Locale } from '@/lib/i18n/locale'
import type { AuthUser } from '@/modules/auth/types'
import { Avatar } from '@/ui/Avatar'
import { Button } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { useProfileMenu } from '../hooks/useProfileMenu'
import { BranchSwitcher } from './BranchSwitcher'

const localeLabelKeys = {
  ru: 'languageRussian',
  en: 'languageEnglish',
  kk: 'languageKazakh',
} as const

interface ProfileMenuProps {
  collapsed: boolean
  user: AuthUser
  onActiveBranchChange: (branchId: number) => Promise<void>
  onLocaleChange: (locale: Locale) => Promise<void>
  onLogout: () => void
}

export function ProfileMenu({
  collapsed,
  user,
  onActiveBranchChange,
  onLocaleChange,
  onLogout,
}: ProfileMenuProps) {
  const { locale, t } = useLocale()
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
            <Button
              className="profile-popover__header-logout"
              kind="quiet"
              startIcon={<Icon name="logout" />}
              ariaLabel={t('logout')}
              onClick={onLogout}
            >
              {t('logout')}
            </Button>
          </header>

          <BranchSwitcher
            branches={menu.branches}
            activeBranchId={user.active_branch}
            loading={menu.loadingBranches}
            disabled={menu.loadingBranches || menu.savingBranch}
            onSelect={(branchId) => void menu.selectBranch(branchId)}
          />

          <fieldset className="profile-popover__languages" disabled={menu.savingLocale}>
            <legend>{t('interfaceLanguage')}</legend>
            <div>
              {supportedLocales.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={locale === item}
                  data-selected={locale === item}
                  onClick={() => void menu.selectLocale(item)}
                >
                  {t(localeLabelKeys[item])}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      ) : null}
    </div>
  )
}
