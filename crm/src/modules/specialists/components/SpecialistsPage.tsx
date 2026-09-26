import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLocale } from '@/lib/i18n/LocaleContext'
import type { ActiveBranchDetails } from '@/modules/auth/types'
import { useBranches } from '@/modules/organizations/hooks/useBranches'
import { Button } from '@/ui/Button'
import { ConfirmDialog } from '@/ui/ConfirmDialog'
import { EmptyState } from '@/ui/EmptyState'
import { Icon } from '@/ui/Icon'
import { Loader } from '@/ui/Loader'
import { SearchField } from '@/ui/SearchField'
import { SelectField } from '@/ui/SelectField'
import { useSpecialistDialog } from '../hooks/useSpecialistDialog'
import { useSpecialistFilters } from '../hooks/useSpecialistFilters'
import { useSpecialists } from '../hooks/useSpecialists'
import type { Specialist } from '../types'
import { SpecialistCard } from './SpecialistCard'
import { SpecialistDialog } from './SpecialistDialog'
import './specialists.css'

interface SpecialistsPageProps {
  activeBranch: ActiveBranchDetails | null
}

export function SpecialistsPage({ activeBranch }: SpecialistsPageProps) {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [pendingDelete, setPendingDelete] = useState<Specialist | null>(null)
  const branchesQuery = useBranches()
  const specialists = useSpecialists()
  const dialog = useSpecialistDialog({
    defaultBranchId: activeBranch?.id ?? 0,
    specialists,
  })

  function handleDelete() {
    if (pendingDelete) specialists.remove.mutate(pendingDelete.id)
    setPendingDelete(null)
  }

  const branchItems = specialists.specialists.filter(
    (item) => !activeBranch || item.branch === activeBranch.id,
  )
  const filters = useSpecialistFilters(branchItems)
  const positions = [...new Set(branchItems.map((item) => item.job_title).filter(Boolean))].sort()

  return (
    <section className="specialists-page">
      <header className="specialists-page__header">
        <div>
          <h1>{t('specialistsTitle')}</h1>
          <span>
            {activeBranch?.name ?? t('selectBranch')} ·{' '}
            {filters.items.length === 1
              ? t('specialistsCountOne')
              : t('specialistsCount', { count: filters.items.length })}
          </span>
        </div>
      </header>

      <div className="specialists-tools">
        <SearchField
          id="specialists-search"
          label={t('searchSpecialists')}
          value={filters.search}
          clearLabel={t('clearSearch')}
          onChange={filters.setSearch}
        />
        <SelectField
          id="specialists-position"
          label={t('allPositions')}
          value={filters.position}
          options={[
            { value: '', label: t('allPositions') },
            ...positions.map((position) => ({ value: position, label: position })),
          ]}
          onChange={filters.setPosition}
        />
        <SelectField
          id="specialists-status"
          label={t('activityFilter')}
          value={filters.status}
          options={[
            { value: 'all', label: t('allStatuses') },
            { value: 'active', label: t('active') },
            { value: 'inactive', label: t('inactive') },
          ]}
          onChange={(value) =>
            filters.setStatus(value === 'active' || value === 'inactive' ? value : 'all')
          }
        />
        <SelectField
          id="specialists-sort"
          label={t('sorting')}
          value={filters.sort}
          options={[
            { value: 'recent', label: t('sortRecent') },
            { value: 'name', label: t('sortByName') },
            { value: 'position', label: t('sortByPosition') },
          ]}
          onChange={(value) =>
            filters.setSort(value === 'name' || value === 'position' ? value : 'recent')
          }
        />
        <Button
          className="specialists-tools__add"
          startIcon={<Icon name="plus" />}
          onClick={dialog.openCreate}
          disabled={!activeBranch}
        >
          {t('addSpecialist')}
        </Button>
      </div>

      {specialists.isLoading ? <Loader label={t('loading')} /> : null}

      {!specialists.isLoading && filters.items.length === 0 ? (
        <EmptyState
          icon="specialists"
          title={t('specialistsEmptyTitle')}
          description={t('specialistsEmptyDescription')}
        />
      ) : null}

      <div className="specialist-grid">
        {filters.items.map((specialist) => (
          <SpecialistCard
            key={specialist.id}
            specialist={specialist}
            onOpen={(item) => navigate(`/specialists/${item.id}`)}
            onEdit={(item) => navigate(`/specialists/${item.id}`)}
            onDelete={setPendingDelete}
          />
        ))}
      </div>

      <SpecialistDialog
        dialog={dialog}
        branches={branchesQuery.data ?? []}
        saving={specialists.saving}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t('specialistDeleteTitle')}
        description={t('specialistDeleteConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        loading={specialists.remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}
