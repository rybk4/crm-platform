import { useNavigate, useParams } from 'react-router-dom'

import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Branch } from '@/modules/organizations/types'
import { useBranches } from '@/modules/organizations/hooks/useBranches'
import { useServices } from '@/modules/services/hooks/useServices'
import type { Service } from '@/modules/services/types'
import { ErrorState } from '@/ui/ErrorState'
import { Loader } from '@/ui/Loader'
import { useSpecialistDialog } from '../hooks/useSpecialistDialog'
import { useSpecialistProfile } from '../hooks/useSpecialistProfile'
import { useSpecialists } from '../hooks/useSpecialists'
import type { Specialist } from '../types'
import { SpecialistAboutPanel } from './SpecialistAboutPanel'
import { SpecialistDialog } from './SpecialistDialog'
import { SpecialistPlanningPanel } from './SpecialistPlanningPanel'
import { SpecialistProfileHeader } from './SpecialistProfileHeader'
import { SpecialistProfileTabs } from './SpecialistProfileTabs'
import { SpecialistSchedulePanel } from './SpecialistSchedulePanel'
import { SpecialistServicesPanel } from './SpecialistServicesPanel'
import './specialists-detail.css'

export function SpecialistDetailPage() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const { specialistId } = useParams()
  const specialists = useSpecialists()
  const services = useServices()
  const branches = useBranches()
  const specialist = specialists.specialists.find((item) => item.id === Number(specialistId))
  if (specialists.isLoading || services.isLoading) return <Loader label={t('loading')} />

  if (!specialist) {
    return (
      <ErrorState
        title={t('specialistNotFound')}
        description={t('specialistNotFoundDescription')}
        actionLabel={t('backToSpecialists')}
        onAction={() => navigate('/specialists')}
      />
    )
  }

  const branchServices = services.services.filter(
    (service) => service.branch_id === specialist.branch,
  )

  return (
    <SpecialistProfileContent
      key={specialist.id}
      specialist={specialist}
      services={branchServices}
      branches={branches.data ?? []}
      specialists={specialists}
      onBack={() => navigate('/specialists')}
    />
  )
}

interface SpecialistProfileContentProps {
  specialist: Specialist
  services: Service[]
  branches: Branch[]
  specialists: ReturnType<typeof useSpecialists>
  onBack: () => void
}

function SpecialistProfileContent({
  specialist,
  services,
  branches,
  specialists,
  onBack,
}: SpecialistProfileContentProps) {
  const profile = useSpecialistProfile(specialist, services)
  const dialog = useSpecialistDialog({ defaultBranchId: specialist.branch, specialists })

  return (
    <section className="specialist-profile-page">
      <SpecialistProfileHeader
        specialist={specialist}
        onBack={onBack}
        onEdit={() => dialog.openEdit(specialist)}
      />
      <SpecialistProfileTabs value={profile.tab} onChange={profile.setTab} />

      <div className="specialist-tab-panel" role="tabpanel">
        {profile.tab === 'about' ? <SpecialistAboutPanel specialist={specialist} /> : null}
        {profile.tab === 'schedule' ? (
          <SpecialistSchedulePanel
            schedule={profile.schedule}
            onChange={profile.patchScheduleDay}
            onSave={profile.saveDraft}
          />
        ) : null}
        {profile.tab === 'services' ? (
          <SpecialistServicesPanel
            services={services}
            selectedIds={profile.selectedServiceIds}
            onToggle={profile.toggleService}
            onSave={profile.saveDraft}
          />
        ) : null}
        {profile.tab === 'vacations' || profile.tab === 'payouts' ? (
          <SpecialistPlanningPanel
            tab={profile.tab}
            vacationStart={profile.vacationStart}
            vacationEnd={profile.vacationEnd}
            payoutModel={profile.payoutModel}
            payoutValue={profile.payoutValue}
            onVacationStartChange={profile.setVacationStart}
            onVacationEndChange={profile.setVacationEnd}
            onPayoutModelChange={profile.setPayoutModel}
            onPayoutValueChange={profile.setPayoutValue}
            onSave={profile.saveDraft}
          />
        ) : null}
      </div>

      <SpecialistDialog dialog={dialog} branches={branches} saving={specialists.saving} />
    </section>
  )
}
