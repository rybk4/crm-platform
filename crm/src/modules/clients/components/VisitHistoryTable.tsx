import { formatMoney } from '@/lib/format/money'
import { formatShortDate, formatTime } from '@/lib/format/datetime'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { TranslationKey } from '@/lib/i18n/messages'
import { statusMeta } from '@/modules/journal/model'
import { Icon } from '@/ui/Icon'

import { durationLabel, visitSortKeys } from '../visitHistory'
import type { VisitSortKey } from '../visitHistory'
import type { VisitHistoryTableProps } from './VisitHistoryTable.types'
export type { VisitHistoryTableProps } from './VisitHistoryTable.types'

const columnLabels: Record<VisitSortKey, TranslationKey> = {
  date: 'clientHistoryDate',
  time: 'clientHistoryTime',
  specialist: 'clientHistorySpecialist',
  service: 'clientHistoryService',
  duration: 'clientHistoryDuration',
  price: 'clientHistoryPrice',
}

export function VisitHistoryTable({ rows, totals, sort, onSort }: VisitHistoryTableProps) {
  const { locale, t } = useLocale()
  const duration = (minutes: number) => {
    const label = durationLabel(minutes)
    return t(label.key, label.params)
  }
  const currency = rows[0]?.currency ?? ''
  const ariaSort = (key: VisitSortKey) =>
    sort.key === key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'

  return (
    <div className="visit-table">
      <table>
        <thead>
          <tr>
            {visitSortKeys.map((key) => (
              <th key={key} scope="col" aria-sort={ariaSort(key)}>
                <button type="button" data-active={sort.key === key} onClick={() => onSort(key)}>
                  {t(columnLabels[key])}
                  <Icon
                    name={
                      sort.key === key && sort.direction === 'desc' ? 'chevron-down' : 'chevron-up'
                    }
                    size={16}
                  />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((visit) => (
              <tr key={visit.id}>
                <td>{formatShortDate(visit.starts_at, locale)}</td>
                <td
                  className="visit-table__time"
                  data-tone={statusMeta[visit.status].tone}
                  title={t(statusMeta[visit.status].labelKey)}
                >
                  {formatTime(visit.starts_at, locale)}
                </td>
                <td>{visit.specialist_name}</td>
                <td>{visit.service_name}</td>
                <td>{duration(visit.duration_minutes)}</td>
                <td className="visit-table__price">{formatMoney(visit.price, visit.currency)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="visit-table__empty" colSpan={visitSortKeys.length}>
                {t('clientHistoryEmpty')}
              </td>
            </tr>
          )}
        </tbody>
        {rows.length ? (
          <tfoot>
            <tr>
              <th scope="row">{t('clientHistoryTotal')}</th>
              <td>{t('clientHistoryVisitsCount', { count: totals.count })}</td>
              <td>{t('clientHistorySpecialistsCount', { count: totals.specialists })}</td>
              <td>{t('clientHistoryServicesCount', { count: totals.services })}</td>
              <td>{duration(totals.minutes)}</td>
              <td className="visit-table__price">{formatMoney(totals.amount, currency)}</td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  )
}
