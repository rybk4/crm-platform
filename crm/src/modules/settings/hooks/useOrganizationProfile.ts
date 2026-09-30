import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiErrorMessage } from '@/lib/api/apiErrorMessage'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { notifications } from '@/lib/toast/notifications'
import { settingsApi } from '../api/settingsApi'
import { settingsKeys } from '../api/settingsKeys'
import type { OrganizationProfileInput } from '../types'

/** Данные вкладки «Организация»: профиль, справочник городов и сохранение. */
export function useOrganizationProfile() {
  const { t } = useLocale()
  const queryClient = useQueryClient()

  const profile = useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: ({ signal }) => settingsApi.profile({ signal }),
  })

  const cities = useQuery({
    queryKey: settingsKeys.cities(),
    queryFn: ({ signal }) => settingsApi.cities({ signal }),
  })

  const update = useMutation({
    mutationFn: (input: OrganizationProfileInput) => settingsApi.updateProfile(input),
    onSuccess: async (saved) => {
      notifications.success(t('settingsSaved'))
      queryClient.setQueryData(settingsKeys.profile(), saved)
      await queryClient.invalidateQueries({ queryKey: settingsKeys.profile() })
    },
    onError: (error: unknown) => {
      notifications.error(apiErrorMessage(error, t('errorUnexpected')))
    },
  })

  return {
    profile: profile.data,
    cities: cities.data ?? [],
    isLoading: profile.isPending,
    isError: profile.isError,
    retry: profile.refetch,
    update,
  }
}
