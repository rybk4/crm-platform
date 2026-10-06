import { useLocale } from '@/lib/i18n/LocaleContext'
import type { EntityId } from '@/lib/api/entityId'
import { ErrorState } from '@/ui/ErrorState'
import { Loader } from '@/ui/Loader'
import { TextField } from '@/ui/TextField'
import { useVisitHistory } from '../hooks/useVisitHistory'
import { VisitHistoryTable } from './VisitHistoryTable'

interface ClientVisitHistoryPanelProps {
  clientId: EntityId
}

export function ClientVisitHistoryPanel({ clientId }: ClientVisitHistoryPanelProps) {
  const { t } = useLocale()
  const history = useVisitHistory(clientId)

  return (
    <div className="visit-history">
      <div className="visit-history__period" role="group" aria-label={t('clientHistoryPeriod')}>
        <TextField
          id="visit-history-from"
          name="from"
          type="date"
          label={t('clientHistoryFrom')}
          value={history.period.from}
          onChange={(value) => history.setPeriod({ from: value })}
        />
        <TextField
          id="visit-history-to"
          name="to"
          type="date"
          label={t('clientHistoryTo')}
          value={history.period.to}
          onChange={(value) => history.setPeriod({ to: value })}
        />
      </div>

      {history.isLoading ? <Loader label={t('loading')} /> : null}
      {history.isError ? (
        <ErrorState
          title={t('clientHistoryLoadError')}
          description={t('clientHistoryLoadErrorDescription')}
          actionLabel={t('clientHistoryRetry')}
          onAction={history.retry}
        />
      ) : null}
      {!history.isLoading && !history.isError ? (
        <VisitHistoryTable
          rows={history.rows}
          totals={history.totals}
          sort={history.sort}
          onSort={history.toggleSort}
        />
      ) : null}
    </div>
  )
}
