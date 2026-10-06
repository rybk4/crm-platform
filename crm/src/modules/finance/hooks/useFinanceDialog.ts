import { useState } from 'react'

import type { Bill, BillInput, PaymentMethod, PaymentMethodInput } from '../types'
import type { useFinance } from './useFinance'

const emptyBill: BillInput = {
  name: '',
  amount: '',
  description: '',
  bill_type: 'income',
  payment_methods: [],
}
const emptyMethod: PaymentMethodInput = {
  name: '',
  commission: '0',
  commission_type: 'percent',
  is_active: true,
}

export function useFinanceDialog(finance: ReturnType<typeof useFinance>) {
  const [billOpen, setBillOpen] = useState(false)
  const [methodOpen, setMethodOpen] = useState(false)
  const [bill, setBill] = useState<Bill | null>(null)
  const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [billForm, setBillForm] = useState<BillInput>(emptyBill)
  const [methodForm, setMethodForm] = useState<PaymentMethodInput>(emptyMethod)

  function openBill(item?: Bill) {
    setBill(item ?? null)
    setBillForm(
      item
        ? {
            name: item.name,
            amount: item.amount,
            description: item.description,
            bill_type: item.bill_type,
            payment_methods: item.payment_methods,
          }
        : emptyBill,
    )
    setBillOpen(true)
  }
  function openMethod(item?: PaymentMethod) {
    setMethod(item ?? null)
    setMethodForm(
      item
        ? {
            name: item.name,
            commission: item.commission,
            commission_type: item.commission_type,
            is_active: item.is_active,
          }
        : emptyMethod,
    )
    setMethodOpen(true)
  }
  async function saveBill() {
    if (!billForm.name.trim() || !billForm.amount) return
    await (bill
      ? finance.billUpdate.mutateAsync({ id: bill.id, input: billForm })
      : finance.billCreate.mutateAsync(billForm))
    setBillOpen(false)
  }
  async function saveMethod() {
    if (!methodForm.name.trim()) return
    await (method
      ? finance.methodUpdate.mutateAsync({ id: method.id, input: methodForm })
      : finance.methodCreate.mutateAsync(methodForm))
    setMethodOpen(false)
  }

  return {
    billOpen,
    methodOpen,
    billForm,
    methodForm,
    patchBill: (changes: Partial<BillInput>) =>
      setBillForm((current) => ({ ...current, ...changes })),
    patchMethod: (changes: Partial<PaymentMethodInput>) =>
      setMethodForm((current) => ({ ...current, ...changes })),
    openBill,
    openMethod,
    closeBill: () => setBillOpen(false),
    closeMethod: () => setMethodOpen(false),
    saveBill,
    saveMethod,
  }
}
