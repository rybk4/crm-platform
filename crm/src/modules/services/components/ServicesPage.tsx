import { useMemo, useState } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import type { ActiveBranchDetails } from '@/modules/auth/types'
import { useSpecialists } from '@/modules/specialists/hooks/useSpecialists'
import { Button } from '@/ui/Button'
import { ConfirmDialog } from '@/ui/ConfirmDialog'
import { EmptyState } from '@/ui/EmptyState'
import { Icon } from '@/ui/Icon'
import { Loader } from '@/ui/Loader'
import { PageHeader } from '@/ui/PageHeader'
import { SelectField } from '@/ui/SelectField'
import { Toolbar, ToolbarField } from '@/ui/Toolbar'
import { useServiceDialog } from '../hooks/useServiceDialog'
import { useServices } from '../hooks/useServices'
import { filterBySpecialist } from '../model'
import type { Service } from '../types'
import { ServiceDialog } from './ServiceDialog'
import { ServiceRow } from './ServiceRow'
import './services.css'

interface ServicesPageProps {
  activeBranch: ActiveBranchDetails | null
}

export function ServicesPage({ activeBranch }: ServicesPageProps) {
  const { t } = useLocale()
  const [specialistFilter, setSpecialistFilter] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null)
  const allSpecialists = useSpecialists().specialists
  const specialists = allSpecialists.filter(
    (item) => !activeBranch || item.branch === activeBranch.id,
  )
  const services = useServices()
  const dialog = useServiceDialog({
    defaultSpecialistId: Number(specialistFilter || specialists[0]?.id || 0),
    services,
  })

  const branchServices = services.services.filter(
    (item) => !activeBranch || item.branch_id === activeBranch.id,
  )
  const visible = useMemo(
    () => filterBySpecialist(branchServices, specialistFilter),
    [branchServices, specialistFilter],
  )

  function handleDelete() {
    if (pendingDelete) services.remove.mutate(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <section className="services-page">
      <PageHeader
        title={t('servicesTitle')}
        description={t('servicesDescription')}
        actions={
          <Button
            startIcon={<Icon name="plus" />}
            onClick={dialog.openCreate}
            disabled={!activeBranch || !specialists.length}
          >
            {t('addService')}
          </Button>
        }
      />

      <Toolbar className="services-toolbar">
        <ToolbarField label={t('activeBranch')} value={activeBranch?.name ?? t('selectBranch')} />
        <SelectField
          id="services-specialist-filter"
          label={t('specialist')}
          value={specialistFilter}
          options={[
            { value: '', label: t('allSpecialists') },
            ...specialists.map((item) => ({ value: String(item.id), label: item.full_name })),
          ]}
          onChange={setSpecialistFilter}
        />
        <span className="ui-toolbar__count">{visible.length}</span>
      </Toolbar>

      {services.isLoading ? <Loader label={t('loading')} /> : null}

      {!services.isLoading && visible.length === 0 ? (
        <EmptyState
          icon="services"
          title={t('servicesEmptyTitle')}
          description={t('servicesEmptyDescription')}
        />
      ) : null}

      <div className="service-list">
        {visible.map((service) => (
          <ServiceRow
            key={service.id}
            service={service}
            onEdit={dialog.openEdit}
            onDelete={setPendingDelete}
          />
        ))}
      </div>

      <ServiceDialog dialog={dialog} specialists={specialists} saving={services.saving} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t('serviceDeleteTitle')}
        description={t('serviceDeleteConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        loading={services.remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}
