import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { Checkbox } from '@/ui/Checkbox'
import { Dialog } from '@/ui/Dialog'
import { SelectField } from '@/ui/SelectField'
import { TextField } from '@/ui/TextField'
import type { useFinanceDialog } from '../hooks/useFinanceDialog'

interface FinanceDialogsProps {
  dialog: ReturnType<typeof useFinanceDialog>
  saving: boolean
}

export function FinanceDialogs({ dialog, saving }: FinanceDialogsProps) {
  const { t } = useLocale()
  const actions = (close: () => void, save: () => Promise<void>) => (
    <>
      <Button kind="quiet" onClick={close}>
        {t('cancel')}
      </Button>
      <Button loading={saving} onClick={() => void save()}>
        {t('save')}
      </Button>
    </>
  )
  return (
    <>
      <Dialog
        open={dialog.billOpen}
        title={t('addBill')}
        onClose={dialog.closeBill}
        actions={actions(dialog.closeBill, dialog.saveBill)}
      >
        <div className="business-form">
          <TextField
            id="bill-name"
            name="name"
            label={t('billName')}
            value={dialog.billForm.name}
            onChange={(name) => dialog.patchBill({ name })}
            required
          />
          <TextField
            id="bill-amount"
            name="amount"
            label={t('amount')}
            type="number"
            value={dialog.billForm.amount}
            onChange={(amount) => dialog.patchBill({ amount })}
            required
          />
          <SelectField
            id="bill-type"
            label={t('billType')}
            value={dialog.billForm.bill_type}
            options={[
              { value: 'income', label: t('income') },
              { value: 'expense', label: t('expense') },
            ]}
            onChange={(bill_type) =>
              dialog.patchBill({ bill_type: bill_type === 'expense' ? 'expense' : 'income' })
            }
          />
          <TextField
            id="bill-description"
            name="description"
            label={t('description')}
            multiline
            value={dialog.billForm.description}
            onChange={(description) => dialog.patchBill({ description })}
          />
        </div>
      </Dialog>
      <Dialog
        open={dialog.methodOpen}
        title={t('addPaymentMethod')}
        onClose={dialog.closeMethod}
        actions={actions(dialog.closeMethod, dialog.saveMethod)}
      >
        <div className="business-form">
          <TextField
            id="method-name"
            name="name"
            label={t('paymentMethodName')}
            value={dialog.methodForm.name}
            onChange={(name) => dialog.patchMethod({ name })}
            required
          />
          <TextField
            id="method-commission"
            name="commission"
            label={t('commission')}
            type="number"
            value={dialog.methodForm.commission}
            onChange={(commission) => dialog.patchMethod({ commission })}
          />
          <SelectField
            id="commission-type"
            label={t('commissionType')}
            value={dialog.methodForm.commission_type}
            options={[
              { value: 'percent', label: t('percent') },
              { value: 'fixed', label: t('fixed') },
            ]}
            onChange={(commission_type) =>
              dialog.patchMethod({
                commission_type: commission_type === 'fixed' ? 'fixed' : 'percent',
              })
            }
          />
          <Checkbox
            label={t('active')}
            checked={dialog.methodForm.is_active}
            onChange={(is_active) => dialog.patchMethod({ is_active })}
          />
        </div>
      </Dialog>
    </>
  )
}
