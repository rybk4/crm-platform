import { useLocale } from '@/lib/i18n/LocaleContext'

import { Button } from '@/ui/Button'
import { SelectField } from '@/ui/SelectField'
import { SidePanel } from '@/ui/SidePanel'
import { TextField } from '@/ui/TextField'
import type { ClientFilterDraft } from '../hooks/useClientFilters'
import { statusLabelKeys } from '../model'
import { clientStatuses } from '../types'
import type { ClientFilterPanelProps } from './ClientFilterPanel.types'
export type { ClientFilterPanelProps } from './ClientFilterPanel.types'

export function ClientFilterPanel({ filters, services }: ClientFilterPanelProps) {
  const { t } = useLocale()

  return (
    <SidePanel
      open={filters.panelOpen}
      title={t('clientFilters')}
      closeLabel={t('close')}
      onClose={filters.closePanel}
      footer={
        <>
          <Button fullWidth onClick={filters.apply}>
            {t('clientFiltersApply')}
          </Button>
          <Button kind="danger" fullWidth onClick={filters.reset}>
            {t('clientFiltersReset')}
          </Button>
        </>
      }
    >
      <div className="client-filters">
        <section>
          <h3>{t('clientFilterVisitDate')}</h3>
          <TextField
            id="client-filter-date"
            name="visit_date"
            type="date"
            label={t('clientFilterVisitDate')}
            value={filters.draft.visit_date}
            onChange={(value) => filters.patchDraft({ visit_date: value })}
          />
        </section>
        <section>
          <h3>{t('clientFilterService')}</h3>
          <SelectField
            id="client-filter-service"
            label={t('clientFilterService')}
            value={filters.draft.service}
            options={[
              { value: '', label: t('clientFilterAnyService') },
              ...services.map((item) => ({ value: String(item.id), label: item.name })),
            ]}
            onChange={(value) => filters.patchDraft({ service: value })}
          />
        </section>
        <section>
          <h3>{t('clientStatus')}</h3>
          <SelectField
            id="client-filter-status"
            label={t('clientStatus')}
            value={filters.draft.status}
            options={[
              { value: '', label: t('clientFilterAnyStatus') },
              ...clientStatuses.map((status) => ({
                value: status,
                label: t(statusLabelKeys[status]),
              })),
            ]}
            onChange={(value) =>
              filters.patchDraft({ status: value as ClientFilterDraft['status'] })
            }
          />
        </section>
      </div>
    </SidePanel>
  )
}
