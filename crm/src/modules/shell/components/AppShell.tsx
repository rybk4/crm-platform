import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AnalyticsPage } from '@/modules/analytics/components/AnalyticsPage'
import { CampaignsPage } from '@/modules/campaigns/components/CampaignsPage'
import { FinancePage } from '@/modules/finance/components/FinancePage'
import { LoyaltyPage } from '@/modules/loyalty/components/LoyaltyPage'
import { DashboardPage } from '@/modules/dashboard/components/DashboardPage'
import type { AuthUser } from '@/modules/auth/types'
import { ClientDetailPage } from '@/modules/clients/components/ClientDetailPage'
import { ClientsPage } from '@/modules/clients/components/ClientsPage'
import { JournalPage } from '@/modules/journal/components/JournalPage'
import { ServicesPage } from '@/modules/services/components/ServicesPage'
import { SettingsPage } from '@/modules/settings/components/SettingsPage'
import { SpecialistDetailPage } from '@/modules/specialists/components/SpecialistDetailPage'
import { SpecialistsPage } from '@/modules/specialists/components/SpecialistsPage'
import { useMediaQuery } from '@/lib/browser/useMediaQuery'
import type { EntityId } from '@/lib/api/entityId'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Locale } from '@/lib/i18n/locale'
import { Icon } from '@/ui/Icon'
import { IconButton } from '@/ui/IconButton'
import { Sidebar } from './Sidebar'
import { HelpPage } from './HelpPage'
import './shell.css'

interface AppShellProps {
  user: AuthUser
  onActiveBranchChange: (branchId: EntityId) => Promise<void>
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

        <main ref={contentRef} id="main-content" className="app-content" tabIndex={-1}>
          <Routes>
            <Route
              path="/"
              element={<DashboardPage key={user.active_branch ?? 'none'} user={user} />}
            />
            <Route
              path="/journal"
              element={
                <JournalPage
                  key={user.active_branch ?? 'none'}
                  activeBranch={user.active_branch_details}
                />
              }
            />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:clientId" element={<ClientDetailPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route
              path="/specialists"
              element={
                <SpecialistsPage
                  key={user.active_branch ?? 'none'}
                  activeBranch={user.active_branch_details}
                />
              }
            />
            <Route path="/specialists/:specialistId" element={<SpecialistDetailPage />} />
            <Route
              path="/services"
              element={
                <ServicesPage
                  key={user.active_branch ?? 'none'}
                  activeBranch={user.active_branch_details}
                />
              }
            />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/loyalty" element={<LoyaltyPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/tutorial" element={<HelpPage kind="tutorial" />} />
            <Route path="/support" element={<HelpPage kind="support" />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
