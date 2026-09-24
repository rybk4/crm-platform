import { useState } from 'react'

import { fromDayKey } from '@/lib/datetime/day'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { ActiveBranchDetails } from '@/modules/auth/types'
import { useClients } from '@/modules/clients/hooks/useClients'
import { useServices } from '@/modules/services/hooks/useServices'
import { useSpecialists } from '@/modules/specialists/hooks/useSpecialists'
import { ConfirmDialog } from '@/ui/ConfirmDialog'
import { PageHeader } from '@/ui/PageHeader'
import { useAppointmentDialog } from '../hooks/useAppointmentDialog'
import { useAppointments } from '../hooks/useAppointments'
import { useJournalFilters } from '../hooks/useJournalFilters'
import { boardBounds, sortByStart } from '../model'
import type { Appointment } from '../types'
import { AppointmentDialog } from './AppointmentDialog'
import { JournalContent } from './JournalContent'
import { JournalToolbar } from './JournalToolbar'
import './journal.css'

interface JournalPageProps {
  activeBranch: ActiveBranchDetails | null
}

export function JournalPage({ activeBranch }: JournalPageProps) {
  const { t } = useLocale()
  const [pendingDelete, setPendingDelete] = useState<Appointment | null>(null)
  const filters = useJournalFilters()
  const { specialists } = useSpecialists()
  const { services } = useServices()
  const { clients } = useClients()
  const journal = useAppointments({
    date: filters.date,
    specialist: filters.specialist,
    status: filters.status,
  })

  const day = fromDayKey(filters.date)
  const onDuty = specialists.filter(
    (item) => item.is_active && (!activeBranch || item.branch === activeBranch.id),
  )
  const appointments = sortByStart(
    journal.appointments.filter((item) => onDuty.some((person) => person.id === item.specialist)),
  )

  const dialog = useAppointmentDialog({
    appointments: journal.appointments,
    services,
    defaultDay: filters.date,
    defaultSpecialistId: filters.specialist ?? onDuty[0]?.id ?? 0,
    journal,
  })

  function handleDelete() {
    if (pendingDelete) journal.remove.mutate(pendingDelete.id)
    setPendingDelete(null)
  }

  const columns = filters.specialist
    ? onDuty.filter((item) => item.id === filters.specialist)
    : onDuty

  return (
    <section className="journal-page">
      <PageHeader title={t('journalTitle')} description={t('journalDescription')} />

      <JournalToolbar
        date={filters.date}
        isToday={filters.isToday}
        specialists={onDuty}
        specialist={filters.specialist}
        status={filters.status}
        view={filters.view}
        onDateChange={filters.setDate}
        onShift={filters.shift}
        onToday={filters.goToToday}
        onSpecialistChange={filters.setSpecialist}
        onStatusChange={filters.setStatus}
        onViewChange={filters.setView}
      />

      <JournalContent
        loading={journal.isLoading}
        view={filters.view}
        columns={columns}
        appointments={appointments}
        bounds={boardBounds(columns, day)}
        day={day}
        now={filters.isToday ? new Date() : null}
        onOpen={dialog.openEdit}
        onCreate={dialog.openCreate}
      />

      <AppointmentDialog
        dialog={dialog}
        specialists={onDuty}
        services={services}
        clients={clients}
        saving={journal.saving}
        onDelete={(appointment) => {
          dialog.close()
          setPendingDelete(appointment)
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t('appointmentDeleteTitle')}
        description={t('appointmentDeleteConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        loading={journal.remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}
