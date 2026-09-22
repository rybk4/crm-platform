import { useLocale } from '@/lib/i18n/LocaleContext'
import type { ActiveBranchDetails } from '@/modules/auth/types'
import { useBranches } from '@/modules/organizations/hooks/useBranches'
import { Button } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { Surface } from '@/ui/Surface'
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
  const branchesQuery = useBranches()
  const specialists = useSpecialists()
  const dialog = useSpecialistDialog({
    defaultBranchId: activeBranch?.id ?? 0,
    specialists,
  })

  function handleDelete(specialist: Specialist) {
    if (!window.confirm(t('specialistDeleteConfirm'))) return
    specialists.remove.mutate(specialist.id)
  }

  const items = specialists.specialists

  return (
    <section className="management-page">
      <header className="management-page__header">
        <div>
          <h1>{t('specialistsTitle')}</h1>
          <p>{t('specialistsDescription')}</p>
        </div>
        <Button
          startIcon={<Icon name="plus" />}
          onClick={dialog.openCreate}
          disabled={!activeBranch}
        >
          {t('addSpecialist')}
        </Button>
      </header>

      <Surface className="management-toolbar">
        <div className="active-branch-context">
          <small>{t('activeBranch')}</small>
          <strong>{activeBranch?.name ?? t('selectBranch')}</strong>
          {activeBranch ? <span>{activeBranch.address}</span> : null}
        </div>
        <span>
          {items.length === 1
            ? t('specialistsCountOne')
            : t('specialistsCount', { count: items.length })}
        </span>
      </Surface>

      {specialists.isLoading ? <p className="management-loading">{t('loading')}</p> : null}

      {!specialists.isLoading && items.length === 0 ? (
        <Surface className="management-empty">
          <Icon name="specialists" size={30} />
          <strong>{t('specialistsEmptyTitle')}</strong>
          <p>{t('specialistsEmptyDescription')}</p>
        </Surface>
      ) : null}

      <div className="specialist-list">
        {items.map((specialist) => (
          <SpecialistRow
            key={specialist.id}
            specialist={specialist}
            onEdit={dialog.openEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <SpecialistDialog
        dialog={dialog}
        branches={branchesQuery.data ?? []}
        saving={specialists.saving}
      />
    </section>
  )
}
