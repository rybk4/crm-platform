import { useLocale } from '@/lib/i18n/LocaleContext'
import type { TranslationKey } from '@/lib/i18n/messages'
import { Button } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { SearchField } from '@/ui/SearchField'
import { SelectField } from '@/ui/SelectField'
import type { useClientFilters } from '../hooks/useClientFilters'
import { clientSorts } from '../model'
import type { ClientSort } from '../model'

interface ClientsToolsProps {
  filters: ReturnType<typeof useClientFilters>
  onAdd: () => void
}

const sortLabels: Record<ClientSort, TranslationKey> = {
  none: 'clientSortNone',
  name: 'clientSortName',
  created: 'clientSortCreated',
}

export function ClientsTools({ filters, onAdd }: ClientsToolsProps) {
  const { t } = useLocale()

  return (
    <div className="clients-tools">
      <div className="clients-tools__filters">
        <SearchField
          id="clients-search"
          label={t('clientsSearch')}
          placeholder={t('clientsSearchPlaceholder')}
          value={filters.search}
          clearLabel={t('clearSearch')}
          onChange={filters.setSearch}
        />
        <SelectField
          id="clients-sort"
          label={t('clientSort')}
          value={filters.sort}
          options={clientSorts.map((sort) => ({ value: sort, label: t(sortLabels[sort]) }))}
          onChange={(value) => filters.setSort(value as ClientSort)}
        />
        <Button
          kind="outline"
          className="clients-tools__filter"
          startIcon={<Icon name="filter" />}
          ariaLabel={t('clientFiltersOpen')}
          onClick={filters.openPanel}
        >
          {filters.activeCount ? t('clientFiltersActive', { count: filters.activeCount }) : null}
        </Button>
      </div>

      <Button startIcon={<Icon name="plus" />} onClick={onAdd}>
        {t('addClient')}
      </Button>
    </div>
  )
}
