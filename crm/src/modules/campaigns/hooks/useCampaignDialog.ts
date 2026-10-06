import { useState } from 'react'
import type { Client } from '@/modules/clients/types'
import type { CampaignInput } from '../types'
import type { useCampaigns } from './useCampaigns'

const emptyForm: CampaignInput = { title: '', message: '', recipients: [] }
export function useCampaignDialog(
  campaigns: ReturnType<typeof useCampaigns>,
  clients: readonly Client[],
) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<CampaignInput>(emptyForm)
  function show() {
    setForm(emptyForm)
    setOpen(true)
  }
  function toggle(phone: string, selected: boolean) {
    setForm((current) => ({
      ...current,
      recipients: selected
        ? [...new Set([...current.recipients, phone])]
        : current.recipients.filter((item) => item !== phone),
    }))
  }
  function selectAll(selected: boolean) {
    setForm((current) => ({
      ...current,
      recipients: selected ? clients.map((item) => item.phone_number) : [],
    }))
  }
  async function send() {
    if (!form.title.trim() || !form.message.trim() || !form.recipients.length) return
    await campaigns.create.mutateAsync(form)
    setOpen(false)
  }
  return {
    open,
    form,
    show,
    close: () => setOpen(false),
    patch: (changes: Partial<CampaignInput>) => setForm((current) => ({ ...current, ...changes })),
    toggle,
    selectAll,
    send,
  }
}
