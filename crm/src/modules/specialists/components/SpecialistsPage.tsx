import { useCallback, useEffect, useState } from 'react'

import { ApiError } from '../../../lib/api/http'
import { useLocale } from '../../../lib/i18n/LocaleContext'
import { notifications } from '../../../lib/toast/notifications'
import { organizationsApi } from '../../organizations/api/organizationsApi'
import type { Branch } from '../../organizations/types'
import type { ActiveBranchDetails } from '../../auth/types'
import { Avatar } from '../../../ui/Avatar'
import { Button } from '../../../ui/Button'
import { Checkbox } from '../../../ui/Checkbox'
import { Dialog } from '../../../ui/Dialog'
import { Icon } from '../../../ui/Icon'
import { IconButton } from '../../../ui/IconButton'
import { SelectField } from '../../../ui/SelectField'
import { Surface } from '../../../ui/Surface'
import { TextField } from '../../../ui/TextField'
import { specialistsApi } from '../api/specialistsApi'
import type { Specialist, SpecialistCertificate, SpecialistInput, WorkSchedule } from '../types'
import './specialists.css'

const weekdayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

function defaultSchedule(): WorkSchedule[] {
  return weekdayKeys.map((_, weekday) => ({
    weekday,
    is_day_off: weekday === 6,
    start_time: weekday === 6 ? null : '09:00',
    end_time: weekday === 6 ? null : '18:00',
    break_start: null,
    break_end: null,
  }))
}

function emptyForm(branchId = 0): SpecialistInput {
  return {
    branch: branchId, first_name: '', last_name: '', middle_name: '', job_title: '',
    phone_number: '', photo_url: '', bio: '', is_active: true, certificates: [], schedule: defaultSchedule(),
  }
}

function toForm(specialist: Specialist): SpecialistInput {
  const schedule = defaultSchedule().map((day) => {
    const stored = specialist.schedule.find((item) => item.weekday === day.weekday)
    return stored ? {
      ...stored,
      start_time: stored.start_time?.slice(0, 5) ?? null,
      end_time: stored.end_time?.slice(0, 5) ?? null,
      break_start: stored.break_start?.slice(0, 5) ?? null,
      break_end: stored.break_end?.slice(0, 5) ?? null,
    } : day
  })
  return { ...specialist, schedule, certificates: specialist.certificates.map((item) => ({ ...item })) }
}

function initials(specialist: Specialist) {
  return `${specialist.first_name[0] ?? ''}${specialist.last_name[0] ?? ''}`.toUpperCase()
}

interface SpecialistsPageProps {
  activeBranch: ActiveBranchDetails | null
}

export function SpecialistsPage({ activeBranch }: SpecialistsPageProps) {
  const { t } = useLocale()
  const [branches, setBranches] = useState<Branch[]>([])
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Specialist | null>(null)
  const [form, setForm] = useState<SpecialistInput>(emptyForm())

  const load = useCallback(async () => {
    try {
      const [branchData, specialistData] = await Promise.all([organizationsApi.listBranches(), specialistsApi.list()])
      setBranches(branchData)
      setSpecialists(specialistData)
    } catch (error) {
      notifications.error(error instanceof ApiError ? error.message : t('errorUnexpected'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [load])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm(activeBranch?.id ?? 0))
    setDialogOpen(true)
  }

  function openEdit(specialist: Specialist) {
    setEditing(specialist)
    setForm(toForm(specialist))
    setDialogOpen(true)
  }

  async function save() {
    if (!form.branch || !form.first_name.trim() || !form.last_name.trim()) {
      notifications.error(t('requiredFields'))
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, certificates: form.certificates.filter((item) => item.title.trim() && item.image_url.trim()) }
      if (editing) {
        await specialistsApi.update(editing.id, payload)
        notifications.success(t('specialistUpdated'))
      } else {
        await specialistsApi.create(payload)
        notifications.success(t('specialistCreated'))
      }
      setDialogOpen(false)
      await load()
    } catch (error) {
      notifications.error(error instanceof ApiError ? error.message : t('errorUnexpected'))
    } finally {
      setSaving(false)
    }
  }

  async function remove(specialist: Specialist) {
    if (!window.confirm(t('specialistDeleteConfirm'))) return
    try {
      await specialistsApi.remove(specialist.id)
      notifications.success(t('specialistDeleted'))
      await load()
    } catch (error) {
      notifications.error(error instanceof ApiError ? error.message : t('errorUnexpected'))
    }
  }

  function updateSchedule(weekday: number, patch: Partial<WorkSchedule>) {
    setForm((current) => ({ ...current, schedule: current.schedule.map((day) => day.weekday === weekday ? { ...day, ...patch } : day) }))
  }

  function updateCertificate(index: number, patch: Partial<SpecialistCertificate>) {
    setForm((current) => ({ ...current, certificates: current.certificates.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }))
  }

  return (
    <section className="management-page">
      <header className="management-page__header">
        <div><h1>{t('specialistsTitle')}</h1><p>{t('specialistsDescription')}</p></div>
        <Button startIcon={<Icon name="plus" />} onClick={openCreate} disabled={!activeBranch}>{t('addSpecialist')}</Button>
      </header>

      <Surface className="management-toolbar">
        <div className="active-branch-context"><small>{t('activeBranch')}</small><strong>{activeBranch?.name ?? t('selectBranch')}</strong>{activeBranch ? <span>{activeBranch.address}</span> : null}</div>
        <span>{specialists.length === 1 ? t('specialistsCountOne') : t('specialistsCount', { count: specialists.length })}</span>
      </Surface>

      {loading ? <p className="management-loading">{t('loading')}</p> : null}
      {!loading && specialists.length === 0 ? (
        <Surface className="management-empty"><Icon name="specialists" size={30} /><strong>{t('specialistsEmptyTitle')}</strong><p>{t('specialistsEmptyDescription')}</p></Surface>
      ) : null}

      <div className="specialist-list">
        {specialists.map((specialist) => (
          <Surface className="specialist-row" key={specialist.id}>
            <Avatar className="specialist-row__avatar" label={specialist.full_name} value={initials(specialist)} src={specialist.photo_url} />
            <div className="specialist-row__identity"><strong>{specialist.full_name}</strong><span>{specialist.job_title || specialist.branch_name}</span>{specialist.job_title ? <small>{specialist.branch_name}</small> : null}</div>
            <div className="specialist-row__contact"><span>{specialist.phone_number || '—'}</span><small>{t('servicesCount', { count: specialist.services_count })}</small></div>
            <div className="schedule-strip" aria-label={t('schedule')}>
              {weekdayKeys.map((key, weekday) => {
                const day = specialist.schedule.find((item) => item.weekday === weekday)
                return <span key={key} data-working={day ? !day.is_day_off : false} title={day && !day.is_day_off ? `${day.start_time?.slice(0, 5)}–${day.end_time?.slice(0, 5)}` : t('dayOff')}>{t(key)}</span>
              })}
            </div>
            <span className="status-pill" data-active={specialist.is_active}>{specialist.is_active ? t('active') : t('inactive')}</span>
            <div className="management-actions">
              <IconButton ariaLabel={t('edit')} title={t('edit')} onClick={() => openEdit(specialist)}><Icon name="edit" /></IconButton>
              <IconButton ariaLabel={t('delete')} title={t('delete')} onClick={() => void remove(specialist)}><Icon name="trash" /></IconButton>
            </div>
          </Surface>
        ))}
      </div>

      <Dialog open={dialogOpen} title={editing ? t('editSpecialist') : t('addSpecialist')} onClose={() => !saving && setDialogOpen(false)} actions={<><Button kind="quiet" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button><Button loading={saving} onClick={() => void save()}>{t('save')}</Button></>}>
        <div className="specialist-form">
          <section className="form-section">
            <SelectField id="specialist-branch" label={t('branch')} value={String(form.branch || '')} options={branches.map((branch) => ({ value: String(branch.id), label: branch.name }))} onChange={(value) => setForm((item) => ({ ...item, branch: Number(value) }))} required />
            <div className="form-grid form-grid--three">
              <TextField id="specialist-last-name" name="last_name" label={t('lastName')} value={form.last_name} onChange={(value) => setForm((item) => ({ ...item, last_name: value }))} required />
              <TextField id="specialist-first-name" name="first_name" label={t('firstName')} value={form.first_name} onChange={(value) => setForm((item) => ({ ...item, first_name: value }))} required />
              <TextField id="specialist-middle-name" name="middle_name" label={t('middleName')} value={form.middle_name} onChange={(value) => setForm((item) => ({ ...item, middle_name: value }))} />
            </div>
            <div className="form-grid">
              <TextField id="specialist-job-title" name="job_title" label={t('jobTitle')} value={form.job_title} onChange={(value) => setForm((item) => ({ ...item, job_title: value }))} />
              <TextField id="specialist-phone" name="phone_number" label={t('phone')} value={form.phone_number} onChange={(value) => setForm((item) => ({ ...item, phone_number: value }))} type="tel" inputMode="tel" />
            </div>
            <TextField id="specialist-photo" name="photo_url" label={t('photoUrl')} value={form.photo_url} onChange={(value) => setForm((item) => ({ ...item, photo_url: value }))} type="url" />
            <TextField id="specialist-bio" name="bio" label={t('bio')} value={form.bio} onChange={(value) => setForm((item) => ({ ...item, bio: value }))} multiline rows={3} />
            <Checkbox label={t('active')} checked={form.is_active} onChange={(value) => setForm((item) => ({ ...item, is_active: value }))} />
          </section>

          <section className="form-section">
            <h3>{t('schedule')}</h3>
            <div className="schedule-editor">
              {form.schedule.map((day) => (
                <div className="schedule-editor__row" key={day.weekday}>
                  <strong>{t(weekdayKeys[day.weekday])}</strong>
                  <Checkbox label={day.is_day_off ? t('dayOff') : t('workingDay')} checked={!day.is_day_off} onChange={(working) => updateSchedule(day.weekday, { is_day_off: !working, start_time: working ? day.start_time ?? '09:00' : null, end_time: working ? day.end_time ?? '18:00' : null })} />
                  <TextField id={`start-${day.weekday}`} name={`start-${day.weekday}`} label={t('start')} value={day.start_time ?? ''} onChange={(value) => updateSchedule(day.weekday, { start_time: value })} type="time" disabled={day.is_day_off} />
                  <TextField id={`end-${day.weekday}`} name={`end-${day.weekday}`} label={t('end')} value={day.end_time ?? ''} onChange={(value) => updateSchedule(day.weekday, { end_time: value })} type="time" disabled={day.is_day_off} />
                </div>
              ))}
            </div>
          </section>

          <section className="form-section">
            <div className="form-section__heading"><h3>{t('certificates')}</h3><Button kind="outline" onClick={() => setForm((item) => ({ ...item, certificates: [...item.certificates, { title: '', image_url: '', issued_at: null, position: item.certificates.length }] }))}>{t('addCertificate')}</Button></div>
            {form.certificates.map((certificate, index) => (
              <div className="certificate-row" key={certificate.id ?? index}>
                <TextField id={`certificate-title-${index}`} name={`certificate-title-${index}`} label={t('certificateTitle')} value={certificate.title} onChange={(value) => updateCertificate(index, { title: value })} />
                <TextField id={`certificate-url-${index}`} name={`certificate-url-${index}`} label={t('certificateUrl')} value={certificate.image_url} onChange={(value) => updateCertificate(index, { image_url: value })} type="url" />
                <IconButton ariaLabel={t('delete')} onClick={() => setForm((item) => ({ ...item, certificates: item.certificates.filter((_, itemIndex) => itemIndex !== index) }))}><Icon name="trash" /></IconButton>
              </div>
            ))}
          </section>
        </div>
      </Dialog>
    </section>
  )
}
