import { useCallback, useEffect, useState } from 'react'

import { apiErrorMessage } from '@/lib/api/apiErrorMessage'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Locale } from '@/lib/i18n/locale'
import { notifications } from '@/lib/toast/notifications'
import { useBranches } from '@/modules/organizations/hooks/useBranches'

interface UseProfileMenuOptions {
  activeBranchId: number | null
  onActiveBranchChange: (branchId: number) => Promise<void>
  onLocaleChange: (locale: Locale) => Promise<void>
}

export function useProfileMenu({
  activeBranchId,
  onActiveBranchChange,
  onLocaleChange,
}: UseProfileMenuOptions) {
  const { locale, t } = useLocale()
  const [open, setOpen] = useState(false)
  const [savingBranch, setSavingBranch] = useState(false)
  const [savingLocale, setSavingLocale] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  // Филиалы нужны только при раскрытом меню — запрос уходит по первому открытию.
  const branchesQuery = useBranches({ enabled: open })

  const branchesError = branchesQuery.error
  useEffect(() => {
    if (branchesError) {
      notifications.error(apiErrorMessage(branchesError, t('branchesLoadError')))
    }
  }, [branchesError, t])

  const toggle = useCallback(() => setOpen((value) => !value), [])

  async function selectBranch(branchId: number) {
    if (branchId === activeBranchId || savingBranch) return

    setSavingBranch(true)
    try {
      await onActiveBranchChange(branchId)
      notifications.success(t('branchUpdated'))
    } catch (error) {
      notifications.error(apiErrorMessage(error, t('branchUpdateError')))
    } finally {
      setSavingBranch(false)
    }
  }

  async function selectLocale(nextLocale: Locale) {
    if (nextLocale === locale || savingLocale) return

    setSavingLocale(true)
    try {
      await onLocaleChange(nextLocale)
    } catch (error) {
      notifications.error(apiErrorMessage(error, t('localeUpdateError')))
    } finally {
      setSavingLocale(false)
    }
  }

  return {
    open,
    toggle,
    close,
    branches: branchesQuery.data ?? [],
    loadingBranches: branchesQuery.isFetching,
    savingBranch,
    savingLocale,
    selectBranch,
    selectLocale,
  }
}
