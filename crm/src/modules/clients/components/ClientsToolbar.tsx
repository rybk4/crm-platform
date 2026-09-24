import { useLocale } from '@/lib/i18n/LocaleContext'
import { SearchField } from '@/ui/SearchField'
import { SelectField } from '@/ui/SelectField'
import { Toolbar } from '@/ui/Toolbar'
import { segmentMeta } from '../model'
import { clientSegments, type ClientSegment } from '../types'

interface ClientsToolbarProps {
  search: string
  segment: ClientSegment | null
  count: number
  onSearchChange: (search: string) => void
  onSegmentChange: (segment: ClientSegment | null) => void
}

export function ClientsToolbar({
  search,
  segment,
  count,
  onSearchChange,
  onSegmentChange,
}: ClientsToolbarProps) {
  const { t } = useLocale()

  return (
    <Toolbar className="clients-toolbar">
      <SearchField
        id="clients-search"
        label={t('search')}
        placeholder={t('clientsSearchPlaceholder')}
        value={search}
        clearLabel={t('clearSearch')}
        onChange={onSearchChange}
      />

      <SelectField
        id="clients-segment"
        label={t('clientSegment')}
        value={segment ?? ''}
        options={[
          { value: '', label: t('clientAllSegments') },
          ...clientSegments.map((item) => ({ value: item, label: t(segmentMeta[item].labelKey) })),
        ]}
        onChange={(value) => onSegmentChange(value ? (value as ClientSegment) : null)}
      />

      <span className="ui-toolbar__count">
        {count === 1 ? t('clientsCountOne') : t('clientsCount', { count })}
      </span>
    </Toolbar>
  )
}
