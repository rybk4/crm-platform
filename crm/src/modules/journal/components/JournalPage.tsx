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
import { filterJournalStaff } from '../filterModel'
import { JournalFilters } from './JournalFilters'
import { JournalToolbar } from './JournalToolbar'
import type { JournalPageProps } from './JournalPage.types'
export type { JournalPageProps } from './JournalPage.types'

import './journal.css'
import './journal-views.css'
import './journal-toolbar.css'

export function JournalPage({ activeBranch }: JournalPageProps) {
  const { t } = useLocale()
  const [pendingDelete, setPendingDelete] = useState<Appointment | null>(null)
  const filters = useJournalFilters()
  const [filterOpen, setFilterOpen] = useState(false)
  const { specialists } = useSpecialists()
  const { services } = useServices()
  const { clients } = useClients()
  const finance = useFinance()
  const selectedDay = fromDayKey(filters.date)
  const weekStartDate = new Date(selectedDay)
  weekStartDate.setDate(selectedDay.getDate() - ((selectedDay.getDay() + 6) % 7))
  const weekStart = filters.range?.from ?? dayKey(weekStartDate)
  const weekEnd = filters.range?.to ?? shiftDayKey(weekStart, 6)
  const journal = useAppointments({
    date: filters.view === 'week' ? undefined : filters.date,
    dateFrom: filters.view === 'week' ? weekStart : undefined,
    dateTo: filters.view === 'week' ? weekEnd : undefined,
    specialist: filters.specialist,
    status: filters.status,
  })

  const day = filters.view === 'week' ? fromDayKey(weekStart) : selectedDay
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
    : filterJournalStaff(onDuty, appointments, services, filters.settings)

  return (
    <section className="journal-page">
      <PageHeader title={t('journalTitle')} description={t('journalDescription')} />

      <JournalToolbar
        range={filters.range}
        onRangeChange={filters.selectRange}
        date={filters.date}
        isToday={filters.isToday}
        specialists={onDuty}
        specialist={filters.specialist}
        step={filters.settings.step}
        onDateChange={filters.setDate}
        onShift={filters.shift}
        onToday={filters.goToToday}
        onSpecialistChange={filters.setSpecialist}
        onFilter={() => setFilterOpen(true)}
        onStepChange={(step) => filters.setSettings({ ...filters.settings, step })}
      />

      <JournalContent
        step={filters.settings.step}
        loading={journal.isLoading}
        view={filters.view}
        columns={columns}
        appointments={appointments}
        bounds={boardBounds(columns, day)}
        day={day}
        end={weekEnd}
        now={filters.isToday ? new Date() : null}
        onOpen={dialog.openEdit}
        onCreate={dialog.openCreate}
      />

      {filterOpen ? (
        <JournalFilters
          settings={filters.settings}
          services={services}
          specialists={onDuty}
          onClose={() => setFilterOpen(false)}
          onApply={(settings) => {
            filters.setSettings(settings)
            setFilterOpen(false)
          }}
        />
      ) : null}

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
        sidePanel
        open={pendingDelete !== null}
        title={t('appointmentDeleteTitle')}
        description={t('appointmentDeleteConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        loading={journal.remove.isPending}
      />
    </section>
  )
}
