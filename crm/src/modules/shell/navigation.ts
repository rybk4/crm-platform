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
  { section: 'journal', labelKey: 'navJournal', icon: 'journal', path: '/journal' },
  { section: 'clients', labelKey: 'navClients', icon: 'clients', path: '/clients' },
  { section: 'specialists', labelKey: 'navSpecialists', icon: 'specialists', path: '/specialists' },
  { section: 'services', labelKey: 'navServices', icon: 'services', path: '/services' },
  { section: 'analytics', labelKey: 'navAnalytics', icon: 'analytics', path: '/analytics' },
]
