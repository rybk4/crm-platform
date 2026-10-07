import { useState } from 'react'

import { dayKey, fromDayKey, shiftDayKey } from '@/lib/datetime/day'
import { sameEntityId } from '@/lib/api/entityId'
import { useLocale } from '@/lib/i18n/LocaleContext'

import { useClients } from '@/modules/clients/hooks/useClients'
import { useFinance } from '@/modules/finance/hooks/useFinance'
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
import type { JournalPageProps } from './JournalPage.types'
export type { JournalPageProps } from './JournalPage.types'

import './journal.css'

export function JournalPage({ activeBranch }: JournalPageProps) {
  const { t } = useLocale()
  const [pendingDelete, setPendingDelete] = useState<Appointment | null>(null)
  const filters = useJournalFilters()
  const { specialists } = useSpecialists()
  const { services } = useServices()
  const { clients } = useClients()
  const finance = useFinance()
  const selectedDay = fromDayKey(filters.date)
  const weekStartDate = new Date(selectedDay)
  weekStartDate.setDate(selectedDay.getDate() - ((selectedDay.getDay() + 6) % 7))
  const weekStart = dayKey(weekStartDate)
  const weekEnd = shiftDayKey(weekStart, 6)
  const journal = useAppointments({
    date: filters.view === 'week' ? undefined : filters.date,
    dateFrom: filters.view === 'week' ? weekStart : undefined,
    dateTo: filters.view === 'week' ? weekEnd : undefined,
    specialist: filters.specialist,
    status: filters.status,
  })

  const day = filters.view === 'week' ? weekStartDate : selectedDay
  const onDuty = specialists.filter(
    (item) => item.is_active && (!activeBranch || sameEntityId(item.branch, activeBranch.id)),
  )
  const appointments = sortByStart(
    journal.appointments.filter((item) =>
      onDuty.some((person) => sameEntityId(person.id, item.specialist)),
    ),
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
    ? onDuty.filter((item) => sameEntityId(item.id, filters.specialist))
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
        onShift={(days) => filters.shift(days * (filters.view === 'week' ? 7 : 1))}
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
        paymentMethods={finance.methods.filter((item) => item.is_active)}
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
