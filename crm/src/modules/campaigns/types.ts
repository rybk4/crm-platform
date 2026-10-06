import type { EntityId } from '@/lib/api/entityId'

export interface Campaign {
  id: EntityId
  created_at: string
  title: string
  message: string
  recipients: string[]
  status: 'draft' | 'queued' | 'sent' | 'failed'
  total_recipients: number
  success_count: number
  success_rate: number
}
export type CampaignInput = Pick<Campaign, 'title' | 'message' | 'recipients'>
