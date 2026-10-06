import { useState } from 'react'
import type { LoyaltyKind, LoyaltyProgram, LoyaltyProgramInput } from '../types'
import type { useLoyalty } from './useLoyalty'

function emptyProgram(kind: LoyaltyKind): LoyaltyProgramInput {
  return {
    kind,
    name: '',
    price: '0',
    reward_percent: '0',
    initial_balance: '0',
    visits_count: kind === 'subscription' ? 1 : null,
    validity_days: 365,
    services: [],
    excluded_payment_methods: [],
    is_active: true,
  }
}
export function useLoyaltyDialog(loyalty: ReturnType<typeof useLoyalty>, kind: LoyaltyKind) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LoyaltyProgram | null>(null)
  const [form, setForm] = useState<LoyaltyProgramInput>(() => emptyProgram(kind))
  function show(item?: LoyaltyProgram) {
    setEditing(item ?? null)
    setForm(
      item
        ? {
            kind: item.kind,
            name: item.name,
            price: item.price,
            reward_percent: item.reward_percent,
            initial_balance: item.initial_balance,
            visits_count: item.visits_count,
            validity_days: item.validity_days,
            services: item.services,
            excluded_payment_methods: item.excluded_payment_methods,
            is_active: item.is_active,
          }
        : emptyProgram(kind),
    )
    setOpen(true)
  }
  async function save() {
    if (!form.name.trim()) return
    await (editing
      ? loyalty.update.mutateAsync({ id: editing.id, input: form })
      : loyalty.create.mutateAsync(form))
    setOpen(false)
  }
  return {
    open,
    form,
    show,
    close: () => setOpen(false),
    patch: (changes: Partial<LoyaltyProgramInput>) =>
      setForm((current) => ({ ...current, ...changes })),
    save,
  }
}
