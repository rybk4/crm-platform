import type { TranslationKey } from '@/lib/i18n/messages'
import type { IconName } from '@/ui/Icon'
import type { AppSection } from './types'

export interface NavigationItem {
  icon: IconName
  labelKey: TranslationKey
  path: string
  section: AppSection
}

export const navigationItems: NavigationItem[] = [
  { section: 'dashboard', labelKey: 'navOverview', icon: 'home', path: '/' },
  { section: 'journal', labelKey: 'navJournal', icon: 'journal', path: '/journal' },
  { section: 'clients', labelKey: 'navClients', icon: 'clients', path: '/clients' },
  { section: 'campaigns', labelKey: 'navCampaigns', icon: 'mail', path: '/campaigns' },
  { section: 'specialists', labelKey: 'navSpecialists', icon: 'specialists', path: '/specialists' },
  { section: 'services', labelKey: 'navServices', icon: 'services', path: '/services' },
  { section: 'loyalty', labelKey: 'navLoyalty', icon: 'star', path: '/loyalty' },
  { section: 'finance', labelKey: 'navFinances', icon: 'wallet', path: '/finance' },
  { section: 'analytics', labelKey: 'navAnalytics', icon: 'analytics', path: '/analytics' },
  { section: 'tutorial', labelKey: 'navTutorial', icon: 'note', path: '/tutorial' },
  { section: 'support', labelKey: 'navSupport', icon: 'phone', path: '/support' },
  { section: 'settings', labelKey: 'navSettings', icon: 'settings', path: '/settings' },
]
