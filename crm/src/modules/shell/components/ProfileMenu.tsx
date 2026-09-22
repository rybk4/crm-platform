import { useEffect, useRef, useState } from 'react'

import { ApiError } from '../../../lib/api/http'
import { useLocale } from '../../../lib/i18n/LocaleContext'
import { supportedLocales, type Locale } from '../../../lib/i18n/locale'
import { notifications } from '../../../lib/toast/notifications'
import { Avatar } from '../../../ui/Avatar'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/Icon'
import type { AuthUser } from '../../auth/types'
import { organizationsApi } from '../../organizations/api/organizationsApi'
import type { Branch } from '../../organizations/types'

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

export function ProfileMenu({ collapsed, user, onActiveBranchChange, onLocaleChange, onLogout }: ProfileMenuProps) {
  const { locale, t } = useLocale()
  const [open, setOpen] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchesLoaded, setBranchesLoaded] = useState(false)
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [savingBranch, setSavingBranch] = useState(false)
  const [savingLocale, setSavingLocale] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const displayName = user.name.trim() || user.phone_number
  const avatarValue = user.name.trim().charAt(0).toUpperCase() || 'C'
  const activeBranch = user.active_branch_details

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  async function toggleMenu() {
    const nextOpen = !open
    setOpen(nextOpen)
    if (!nextOpen || branchesLoaded || loadingBranches) return

    setLoadingBranches(true)
    try {
      setBranches(await organizationsApi.listBranches())
      setBranchesLoaded(true)
    } catch (error) {
      notifications.error(error instanceof ApiError ? error.message : t('branchesLoadError'))
    } finally {
      setLoadingBranches(false)
    }
  }

  async function handleBranchChange(branchId: number) {
    if (branchId === user.active_branch || savingBranch) return
    setSavingBranch(true)
    try {
      await onActiveBranchChange(branchId)
      notifications.success(t('branchUpdated'))
    } catch (error) {
      notifications.error(error instanceof ApiError ? error.message : t('branchUpdateError'))
    } finally {
      setSavingBranch(false)
    }
  }

  async function handleLocaleChange(nextLocale: Locale) {
    if (nextLocale === locale || savingLocale) return
    setSavingLocale(true)
    try {
      await onLocaleChange(nextLocale)
    } catch (error) {
      notifications.error(error instanceof ApiError ? error.message : t('localeUpdateError'))
    } finally {
      setSavingLocale(false)
    }
  }

  return (
    <div ref={rootRef} className="sidebar-profile">
      <button
        ref={triggerRef}
        className="sidebar-account"
        type="button"
        aria-label={t('activeBranch')}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={collapsed ? activeBranch?.name ?? t('selectBranch') : undefined}
        onClick={() => void toggleMenu()}
      >
        <Avatar className="sidebar-account__avatar" label={displayName} value={avatarValue} />
        <span className="sidebar-account__details">
          <strong>{activeBranch?.name ?? t('selectBranch')}</strong>
          <span>{activeBranch?.address ?? t('activeBranch')}</span>
        </span>
        <span className="sidebar-account__chevron" aria-hidden="true" data-open={open}>
          <Icon name="chevron-up" size={18} />
        </span>
      </button>

      {open ? (
        <div className="profile-popover" role="dialog" aria-label={t('profile')}>
          <header className="profile-popover__header">
            <Avatar label={displayName} value={avatarValue} />
            <div>
              <strong>{displayName}</strong>
              <span>{user.phone_number}</span>
            </div>
            <Button className="profile-popover__header-logout" kind="quiet" startIcon={<Icon name="logout" />} ariaLabel={t('logout')} onClick={onLogout}>
              {t('logout')}
            </Button>
          </header>

          <fieldset className="branch-switcher" disabled={loadingBranches || savingBranch}>
            <legend>{t('activeBranch')}</legend>
            {loadingBranches ? <p role="status">{t('loading')}</p> : null}
            {!loadingBranches && branches.length === 0 ? <p>{t('noBranches')}</p> : null}
            <div className="branch-switcher__list">
              {branches.map((branch) => (
                <label key={branch.id} className="branch-option" data-selected={user.active_branch === branch.id}>
                  <input
                    type="radio"
                    name="active-branch"
                    value={branch.id}
                    checked={user.active_branch === branch.id}
                    onChange={() => void handleBranchChange(branch.id)}
                  />
                  <span className="branch-option__indicator" aria-hidden="true" />
                  <span className="branch-option__copy">
                    <strong>{branch.name}</strong>
                    <small>{branch.address}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="profile-popover__languages" disabled={savingLocale}>
            <legend>{t('interfaceLanguage')}</legend>
            <div>
              {supportedLocales.map((item) => (
                <button key={item} type="button" aria-pressed={locale === item} data-selected={locale === item} onClick={() => void handleLocaleChange(item)}>
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
