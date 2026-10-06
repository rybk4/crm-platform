import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiErrorMessage } from '@/lib/api/apiErrorMessage'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { notifications } from '@/lib/toast/notifications'
import { campaignsApi } from '../api/campaignsApi'
import type { CampaignInput } from '../types'

const campaignKey = ['campaigns'] as const
export function useCampaigns() {
  const { t } = useLocale()
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: campaignKey,
    queryFn: ({ signal }) => campaignsApi.list({ signal }),
  })
  const create = useMutation({
    mutationFn: (input: CampaignInput) => campaignsApi.create(input),
    onSuccess: () => {
      notifications.success(t('campaignSent'))
      void queryClient.invalidateQueries({ queryKey: campaignKey })
    },
    onError: (error) => notifications.error(apiErrorMessage(error, t('errorUnexpected'))),
  })
  return { campaigns: query.data ?? [], isLoading: query.isLoading, create }
}
