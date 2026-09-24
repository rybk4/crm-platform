import { formatMoney } from '@/lib/format/money'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Card } from '@/ui/Card'
import { BarList } from '@/ui/charts/BarList'
import type { TopServiceItem } from '../types'

interface TopServicesCardProps {
  items: readonly TopServiceItem[]
  currency: string
}

export function TopServicesCard({ items, currency }: TopServicesCardProps) {
  const { t } = useLocale()

  return (
    <Card
      className="analytics-card analytics-card--wide"
      title={t('analyticsTopServices')}
      hint={t('analyticsTopServicesHint')}
    >
      <BarList
        ariaLabel={t('analyticsTopServices')}
        items={items.map((item) => ({
          id: String(item.service_id),
          label: item.service_name,
          value: Number(item.revenue),
          valueLabel: formatMoney(item.revenue, currency),
          hint: t('appointmentsCount', { count: item.appointments_count }),
        }))}
      />
    </Card>
  )
}
