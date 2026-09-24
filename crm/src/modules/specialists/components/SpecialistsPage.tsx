import { useLocale } from '@/lib/i18n/LocaleContext'
import type { ActiveBranchDetails } from '@/modules/auth/types'
import { useBranches } from '@/modules/organizations/hooks/useBranches'
import { useState } from 'react'

import { Button } from '@/ui/Button'
import { ConfirmDialog } from '@/ui/ConfirmDialog'
import { EmptyState } from '@/ui/EmptyState'
import { Icon } from '@/ui/Icon'
import { Loader } from '@/ui/Loader'
import { PageHeader } from '@/ui/PageHeader'
import { Toolbar, ToolbarField } from '@/ui/Toolbar'
import { useSpecialistDialog } from '../hooks/useSpecialistDialog'
import { useSpecialists } from '../hooks/useSpecialists'
import type { Specialist } from '../types'
import { SpecialistDialog } from './SpecialistDialog'
import { SpecialistRow } from './SpecialistRow'
import './specialists.css'

interface SpecialistsPageProps {
  activeBranch: ActiveBranchDetails | null
}

export function SpecialistsPage({ activeBranch }: SpecialistsPageProps) {
  const { t } = useLocale()
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

  const items = specialists.specialists.filter(
    (item) => !activeBranch || item.branch === activeBranch.id,
  )

  return (
    <section className="specialists-page">
      <PageHeader
        title={t('specialistsTitle')}
        description={t('specialistsDescription')}
        actions={
          <Button
            startIcon={<Icon name="plus" />}
            onClick={dialog.openCreate}
            disabled={!activeBranch}
          >
            {t('addSpecialist')}
          </Button>
        }
      />

      <Toolbar className="specialists-toolbar">
        <ToolbarField
          label={t('activeBranch')}
          value={activeBranch?.name ?? t('selectBranch')}
          hint={activeBranch?.address}
        />
        <span className="ui-toolbar__count">
          {items.length === 1
            ? t('specialistsCountOne')
            : t('specialistsCount', { count: items.length })}
        </span>
      </Toolbar>

      {specialists.isLoading ? <Loader label={t('loading')} /> : null}

      {!specialists.isLoading && items.length === 0 ? (
        <EmptyState
          icon="specialists"
          title={t('specialistsEmptyTitle')}
          description={t('specialistsEmptyDescription')}
        />
      ) : null}

      <div className="specialist-list">
        {items.map((specialist) => (
          <SpecialistRow
            key={specialist.id}
            specialist={specialist}
            onEdit={dialog.openEdit}
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
