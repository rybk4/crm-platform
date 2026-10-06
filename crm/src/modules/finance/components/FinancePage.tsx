import { useState } from 'react'

import { formatMoney } from '@/lib/format/money'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { ConfirmDialog } from '@/ui/ConfirmDialog'
import { EmptyState } from '@/ui/EmptyState'
import { Icon } from '@/ui/Icon'
import { IconButton } from '@/ui/IconButton'
import { Loader } from '@/ui/Loader'
import { PageHeader } from '@/ui/PageHeader'
import { SegmentedControl } from '@/ui/SegmentedControl'
import { useFinance } from '../hooks/useFinance'
import { useFinanceDialog } from '../hooks/useFinanceDialog'
import type { Bill, PaymentMethod } from '../types'
import { FinanceDialogs } from './FinanceDialogs'
import './finance.css'

export function FinancePage() {
  const { t } = useLocale()
  const finance = useFinance()
  const dialog = useFinanceDialog(finance)
  const [tab, setTab] = useState('bills')
  const [deleting, setDeleting] = useState<Bill | PaymentMethod | null>(null)
  const items = tab === 'bills' ? finance.bills : finance.methods
  function remove() {
    if (!deleting) return
    ;(tab === 'bills' ? finance.billRemove : finance.methodRemove).mutate(deleting.id)
    setDeleting(null)
  }
  return (
    <section className="business-page">
      <PageHeader
        title={t('financesTitle')}
        description={t('financesDescription')}
        actions={
          <Button
            startIcon={<Icon name="plus" />}
            onClick={() => (tab === 'bills' ? dialog.openBill() : dialog.openMethod())}
          >
            {tab === 'bills' ? t('addBill') : t('addPaymentMethod')}
          </Button>
        }
      />
      <SegmentedControl
        ariaLabel={t('financesTitle')}
        value={tab}
        options={[
          { value: 'bills', label: t('billsTab') },
          { value: 'methods', label: t('paymentMethodsTab') },
        ]}
        onChange={setTab}
      />
      {finance.isLoading ? <Loader label={t('loading')} /> : null}
      {!finance.isLoading && !items.length ? (
        <EmptyState
          icon="wallet"
          title={t('financesEmpty')}
          description={t('financesDescription')}
        />
      ) : null}
      <div className="business-grid">
        {tab === 'bills'
          ? finance.bills.map((item) => (
              <Card
                key={item.id}
                title={item.name}
                hint={item.bill_type === 'income' ? t('income') : t('expense')}
                actions={
                  <>
                    <IconButton ariaLabel={t('edit')} onClick={() => dialog.openBill(item)}>
                      <Icon name="edit" />
                    </IconButton>
                    <IconButton ariaLabel={t('delete')} onClick={() => setDeleting(item)}>
                      <Icon name="trash" />
                    </IconButton>
                  </>
                }
              >
                <strong>{formatMoney(item.amount, 'KZT')}</strong>
                <p>{item.description}</p>
              </Card>
            ))
          : finance.methods.map((item) => (
              <Card
                key={item.id}
                title={item.name}
                hint={item.commission_type === 'percent' ? t('percent') : t('fixed')}
                actions={
                  <>
                    <IconButton ariaLabel={t('edit')} onClick={() => dialog.openMethod(item)}>
                      <Icon name="edit" />
                    </IconButton>
                    <IconButton ariaLabel={t('delete')} onClick={() => setDeleting(item)}>
                      <Icon name="trash" />
                    </IconButton>
                  </>
                }
              >
                <strong>
                  {item.commission}
                  {item.commission_type === 'percent' ? '%' : ' KZT'}
                </strong>
              </Card>
            ))}
      </div>
      <FinanceDialogs
        dialog={dialog}
        saving={
          finance.billCreate.isPending ||
          finance.billUpdate.isPending ||
          finance.methodCreate.isPending ||
          finance.methodUpdate.isPending
        }
      />
      <ConfirmDialog
        open={deleting !== null}
        title={t('financeDeleteTitle')}
        description={t('financeDeleteTitle')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </section>
  )
}
