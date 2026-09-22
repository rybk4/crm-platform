import { useMemo, useState } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import type { ActiveBranchDetails } from '@/modules/auth/types'
import { useSpecialists } from '@/modules/specialists/hooks/useSpecialists'
import { Button } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { SelectField } from '@/ui/SelectField'
import { Surface } from '@/ui/Surface'
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
  const { specialists } = useSpecialists()
  const services = useServices()
  const dialog = useServiceDialog({
    defaultSpecialistId: Number(specialistFilter || specialists[0]?.id || 0),
    services,
  })

  const visible = useMemo(
    () => filterBySpecialist(services.services, specialistFilter),
    [services.services, specialistFilter],
  )

  function handleDelete(service: Service) {
    if (!window.confirm(t('serviceDeleteConfirm'))) return
    services.remove.mutate(service.id)
  }

  return (
    <section className="management-page">
      <header className="management-page__header">
        <div>
          <h1>{t('servicesTitle')}</h1>
          <p>{t('servicesDescription')}</p>
        </div>
        <Button
          startIcon={<Icon name="plus" />}
          onClick={dialog.openCreate}
          disabled={!activeBranch || !specialists.length}
        >
          {t('addService')}
        </Button>
      </header>

      <Surface className="services-toolbar">
        <div className="active-branch-context">
          <small>{t('activeBranch')}</small>
          <strong>{activeBranch?.name ?? t('selectBranch')}</strong>
        </div>
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
        <span>{visible.length}</span>
      </Surface>

      {services.isLoading ? <p className="management-loading">{t('loading')}</p> : null}

      {!services.isLoading && visible.length === 0 ? (
        <Surface className="management-empty">
          <Icon name="services" size={30} />
          <strong>{t('servicesEmptyTitle')}</strong>
          <p>{t('servicesEmptyDescription')}</p>
        </Surface>
      ) : null}

      <div className="service-list">
        {visible.map((service) => (
          <ServiceRow
            key={service.id}
            service={service}
            onEdit={dialog.openEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <ServiceDialog dialog={dialog} specialists={specialists} saving={services.saving} />
    </section>
  )
}
