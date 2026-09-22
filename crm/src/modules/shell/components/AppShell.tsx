import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AnalyticsPage } from '../../analytics/components/AnalyticsPage'
import type { AuthUser } from '../../auth/types'
import { ClientsPage } from '../../clients/components/ClientsPage'
import { JournalPage } from '../../journal/components/JournalPage'
import { ServicesPage } from '../../services/components/ServicesPage'
import { SpecialistsPage } from '../../specialists/components/SpecialistsPage'
import { useMediaQuery } from '../../../lib/browser/useMediaQuery'
import { useLocale } from '../../../lib/i18n/LocaleContext'
import type { Locale } from '../../../lib/i18n/locale'
import { Icon } from '../../../ui/Icon'
import { IconButton } from '../../../ui/IconButton'
import { Sidebar } from './Sidebar'
import { ThemeStudio } from './ThemeStudio'
import './shell.css'

interface AppShellProps {
  user: AuthUser
  onActiveBranchChange: (branchId: number) => Promise<void>
  onLocaleChange: (locale: Locale) => Promise<void>
  onLogout: () => void
}

export function AppShell({ user, onActiveBranchChange, onLocaleChange, onLogout }: AppShellProps) {
  const { t } = useLocale()
  const mobile = useMediaQuery('(max-width: 860px)')
  const location = useLocation()
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const contentRef = useRef<HTMLElement>(null)
  const collapsed = !mobile && desktopCollapsed

  useEffect(() => {
    contentRef.current?.focus()
  }, [location.pathname])

  return (
    <div className="app-shell" data-sidebar-collapsed={collapsed}>
      <a className="skip-link" href="#main-content">
        {t('skipToContent')}
      </a>

      {!mobile || mobileOpen ? (
        <Sidebar
          collapsed={collapsed}
          mobile={mobile}
          open
          user={user}
          onActiveBranchChange={onActiveBranchChange}
          onClose={() => setMobileOpen(false)}
          onLocaleChange={onLocaleChange}
          onLogout={onLogout}
          onToggleCollapsed={() => setDesktopCollapsed((value) => !value)}
        />
      ) : null}

      {mobile && mobileOpen ? (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label={t('closeMenu')}
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="app-workspace">
        {mobile && !mobileOpen ? (
          <IconButton
            className="mobile-menu-trigger"
            ariaLabel={t('openMenu')}
            ariaControls="app-sidebar"
            expanded={false}
            onClick={() => setMobileOpen(true)}
          >
            <Icon name="menu" />
          </IconButton>
        ) : null}

        <ThemeStudio />

        <main ref={contentRef} id="main-content" className="app-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Navigate to="/journal" replace />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/specialists" element={<SpecialistsPage key={user.active_branch ?? 'none'} activeBranch={user.active_branch_details} />} />
            <Route path="/services" element={<ServicesPage key={user.active_branch ?? 'none'} activeBranch={user.active_branch_details} />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/journal" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
