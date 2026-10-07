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
import { useLoyalty } from '../hooks/useLoyalty'
import { useLoyaltyDialog } from '../hooks/useLoyaltyDialog'
import type { LoyaltyKind, LoyaltyProgram } from '../types'
import { LoyaltyDialog } from './LoyaltyDialog'
import '@/ui/business-layout.css'

export function LoyaltyPage() {
  const { t } = useLocale()
  const loyalty = useLoyalty()
  const [kind, setKind] = useState<LoyaltyKind>('bonus')
  const [deleting, setDeleting] = useState<LoyaltyProgram | null>(null)
  const dialog = useLoyaltyDialog(loyalty, kind)
  const programs = loyalty.programs.filter((item) => item.kind === kind)
  return (
    <section className="business-page">
      <PageHeader
        title={t('loyaltyTitle')}
        description={t('loyaltyDescription')}
        actions={
          <Button startIcon={<Icon name="plus" />} onClick={() => dialog.show()}>
            {t('addLoyaltyProgram')}
          </Button>
        }
      />
      <SegmentedControl
        ariaLabel={t('loyaltyTitle')}
        value={kind}
        options={[
          { value: 'bonus', label: t('bonusCards') },
          { value: 'subscription', label: t('subscriptions') },
          { value: 'certificate', label: t('certificates') },
        ]}
        onChange={(value) => setKind(value as LoyaltyKind)}
      />
      {loyalty.isLoading ? <Loader label={t('loading')} /> : null}
      {!loyalty.isLoading && !programs.length ? (
        <EmptyState icon="star" title={t('loyaltyEmpty')} description={t('loyaltyDescription')} />
      ) : null}
      <div className="business-grid">
        {programs.map((item) => (
          <Card
            key={item.id}
            title={item.name}
            hint={t('clientsCountLabel', { count: item.clients_count })}
            actions={
              <>
                <IconButton ariaLabel={t('edit')} onClick={() => dialog.show(item)}>
                  <Icon name="edit" />
                </IconButton>
                <IconButton ariaLabel={t('delete')} onClick={() => setDeleting(item)}>
                  <Icon name="trash" />
                </IconButton>
              </>
            }
          >
            <strong>{formatMoney(item.price, 'KZT')}</strong>
            <p>
              {kind === 'bonus'
                ? `${item.reward_percent}%`
                : kind === 'subscription'
                  ? t('visitsCount') + `: ${item.visits_count ?? 0}`
                  : t('initialBalance') + `: ${item.initial_balance}`}
            </p>
          </Card>
        ))}
      </div>
      <LoyaltyDialog
        dialog={dialog}
        saving={loyalty.create.isPending || loyalty.update.isPending}
      />
      <ConfirmDialog
        open={deleting !== null}
        title={t('loyaltyDeleteTitle')}
        description={t('loyaltyDeleteTitle')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={() => {
          if (deleting) loyalty.remove.mutate(deleting.id)
          setDeleting(null)
        }}
        onCancel={() => setDeleting(null)}
      />
    </section>
  )
}
