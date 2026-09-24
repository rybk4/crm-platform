import { useLocale } from '@/lib/i18n/LocaleContext'
import { statusMeta } from '@/modules/journal/model'
import { Card } from '@/ui/Card'
import { StackedBar } from '@/ui/charts/StackedBar'
import type { StatusBreakdownItem } from '../types'

interface StatusMixCardProps {
  items: readonly StatusBreakdownItem[]
}

/** Зелёный и красный не ставим рядом: разница видна и при дальтонизме. */
const order = ['completed', 'confirmed', 'pending', 'cancelled', 'no_show'] as const

export function StatusMixCard({ items }: StatusMixCardProps) {
  const { t } = useLocale()

  const segments = order.map((status) => {
    const found = items.find((item) => item.status === status)

    return {
      id: status,
      label: t(statusMeta[status].labelKey),
      value: found?.count ?? 0,
      valueLabel: String(found?.count ?? 0),
      tone: statusMeta[status].tone,
    }
  })

  return (
    <Card
      className="analytics-card"
      title={t('analyticsStatusMix')}
      hint={t('analyticsStatusMixHint')}
    >
      <StackedBar segments={segments} ariaLabel={t('analyticsStatusMix')} />
    </Card>
  )
}
