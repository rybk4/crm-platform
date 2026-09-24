import { NavLink } from 'react-router-dom'

import { isDemoMode } from '@/lib/api/demoMode'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Locale } from '@/lib/i18n/locale'
import { Icon } from '@/ui/Icon'
import { IconButton } from '@/ui/IconButton'
import type { AuthUser } from '@/modules/auth/types'
import { navigationItems } from '../navigation'
import { ProfileMenu } from './ProfileMenu'

interface SidebarProps {
  collapsed: boolean
  mobile: boolean
  open: boolean
  user: AuthUser
  onActiveBranchChange: (branchId: number) => Promise<void>
  onClose: () => void
  onLocaleChange: (locale: Locale) => Promise<void>
  onLogout: () => void
  onToggleCollapsed: () => void
}

export function Sidebar({
  collapsed,
  mobile,
  open,
  user,
  onActiveBranchChange,
  onClose,
  onLocaleChange,
  onLogout,
  onToggleCollapsed,
}: SidebarProps) {
  const { t } = useLocale()

  return (
    <aside
      id="app-sidebar"
      className="app-sidebar"
      aria-label={t('mainNavigation')}
      data-collapsed={collapsed}
      data-open={open}
    >
      <div className="sidebar-brand">
        <div className="brand-mark" aria-hidden="true">
          C
        </div>
        <span className="sidebar-brand__name">{t('appName')}</span>
        <IconButton
          className="sidebar-brand__toggle"
          ariaLabel={mobile ? t('closeMenu') : collapsed ? t('expandMenu') : t('collapseMenu')}
          title={mobile ? t('closeMenu') : collapsed ? t('expandMenu') : t('collapseMenu')}
          onClick={mobile ? onClose : onToggleCollapsed}
        >
          <Icon name={mobile ? 'close' : 'menu'} />
        </IconButton>
      </div>

      <nav className="sidebar-nav" aria-label={t('crmSections')}>
        {navigationItems.map((item) => (
          <NavLink
            key={item.section}
            className="sidebar-nav__item"
            to={item.path}
            end={item.path === '/'}
            title={collapsed ? t(item.labelKey) : undefined}
            onClick={mobile ? onClose : undefined}
          >
            <span className="sidebar-nav__icon">
              <Icon name={item.icon} />
            </span>
            <span className="sidebar-nav__label">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      {isDemoMode() ? (
        <p className="sidebar-demo" title={t('demoDataHint')}>
          <span aria-hidden="true" />
          <span className="sidebar-demo__label">{t('demoDataBadge')}</span>
        </p>
      ) : null}

      <ProfileMenu
        collapsed={collapsed}
        user={user}
        onActiveBranchChange={onActiveBranchChange}
        onLocaleChange={onLocaleChange}
        onLogout={onLogout}
      />
    </aside>
  )
}
