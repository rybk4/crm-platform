import { useCallback, useEffect, useMemo, useState } from 'react'

import { ApiError } from '../../../lib/api/http'
import { useLocale } from '../../../lib/i18n/LocaleContext'
import { notifications } from '../../../lib/toast/notifications'
import type { ActiveBranchDetails } from '../../auth/types'
import { specialistsApi } from '../../specialists/api/specialistsApi'
import type { Specialist } from '../../specialists/types'
import { Button } from '../../../ui/Button'
import { Checkbox } from '../../../ui/Checkbox'
import { Dialog } from '../../../ui/Dialog'
import { Icon } from '../../../ui/Icon'
import { IconButton } from '../../../ui/IconButton'
import { SelectField } from '../../../ui/SelectField'
import { Surface } from '../../../ui/Surface'
import { TextField } from '../../../ui/TextField'
import { servicesApi } from '../api/servicesApi'
import type { Service, ServiceInput } from '../types'
import './services.css'

function emptyForm(specialist = 0): ServiceInput {
  return { specialist, name: '', description: '', duration_minutes: 60, price: '', currency: 'KZT', is_active: true }
}

function formatPrice(value: string, currency: string) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return `${value} ${currency}`
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(amount) + ` ${currency}`
}

interface ServicesPageProps {
  activeBranch: ActiveBranchDetails | null
}

export function ServicesPage({ activeBranch }: ServicesPageProps) {
  const { t } = useLocale()
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [specialistFilter, setSpecialistFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceInput>(emptyForm())

  const load = useCallback(async () => {
    try {
      const [specialistData, serviceData] = await Promise.all([
        specialistsApi.list(), servicesApi.list(),
      ])
      setSpecialists(specialistData)
      setServices(serviceData)
    } catch (error) {
      notifications.error(error instanceof ApiError ? error.message : t('errorUnexpected'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [load])

  const visible = useMemo(
    () => services.filter((item) => !specialistFilter || String(item.specialist) === specialistFilter),
    [services, specialistFilter],
  )

  function openCreate() {
    setEditing(null)
    setForm(emptyForm(Number(specialistFilter || specialists[0]?.id || 0)))
    setDialogOpen(true)
  }

  function openEdit(service: Service) {
    setEditing(service)
    setForm({ specialist: service.specialist, name: service.name, description: service.description, duration_minutes: service.duration_minutes, price: service.price, currency: service.currency, is_active: service.is_active })
    setDialogOpen(true)
  }

  async function save() {
    if (!form.specialist || !form.name.trim() || !form.duration_minutes || !form.price) {
      notifications.error(t('requiredFields'))
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await servicesApi.update(editing.id, form)
        notifications.success(t('serviceUpdated'))
      } else {
        await servicesApi.create(form)
        notifications.success(t('serviceCreated'))
      }
      setDialogOpen(false)
      await load()
    } catch (error) {
      notifications.error(error instanceof ApiError ? error.message : t('errorUnexpected'))
    } finally {
      setSaving(false)
    }
  }

  async function remove(service: Service) {
    if (!window.confirm(t('serviceDeleteConfirm'))) return
    try {
      await servicesApi.remove(service.id)
      notifications.success(t('serviceDeleted'))
      await load()
    } catch (error) {
      notifications.error(error instanceof ApiError ? error.message : t('errorUnexpected'))
    }
  }

  return (
    <section className="management-page">
      <header className="management-page__header">
        <div><h1>{t('servicesTitle')}</h1><p>{t('servicesDescription')}</p></div>
        <Button startIcon={<Icon name="plus" />} onClick={openCreate} disabled={!activeBranch || !specialists.length}>{t('addService')}</Button>
      </header>

      <Surface className="services-toolbar">
        <div className="active-branch-context"><small>{t('activeBranch')}</small><strong>{activeBranch?.name ?? t('selectBranch')}</strong></div>
        <SelectField id="services-specialist-filter" label={t('specialist')} value={specialistFilter} options={[{ value: '', label: t('allSpecialists') }, ...specialists.map((item) => ({ value: String(item.id), label: item.full_name }))]} onChange={setSpecialistFilter} />
        <span>{visible.length}</span>
      </Surface>

      {loading ? <p className="management-loading">{t('loading')}</p> : null}
      {!loading && visible.length === 0 ? <Surface className="management-empty"><Icon name="services" size={30} /><strong>{t('servicesEmptyTitle')}</strong><p>{t('servicesEmptyDescription')}</p></Surface> : null}

      <div className="service-list">
        {visible.map((service) => (
          <Surface className="service-row" key={service.id}>
            <div className="service-row__name"><strong>{service.name}</strong><span>{service.description || '—'}</span></div>
            <div className="service-row__owner"><strong>{service.specialist_name}</strong><span>{service.branch_name}</span></div>
            <div className="service-row__metric"><small>{t('durationMinutes')}</small><strong>{t('minutesShort', { count: service.duration_minutes })}</strong></div>
            <div className="service-row__metric service-row__price"><small>{t('price')}</small><strong>{formatPrice(service.price, service.currency)}</strong></div>
            <span className="status-pill" data-active={service.is_active}>{service.is_active ? t('active') : t('inactive')}</span>
            <div className="management-actions"><IconButton ariaLabel={t('edit')} title={t('edit')} onClick={() => openEdit(service)}><Icon name="edit" /></IconButton><IconButton ariaLabel={t('delete')} title={t('delete')} onClick={() => void remove(service)}><Icon name="trash" /></IconButton></div>
          </Surface>
        ))}
      </div>

      <Dialog open={dialogOpen} title={editing ? t('editService') : t('addService')} onClose={() => !saving && setDialogOpen(false)} actions={<><Button kind="quiet" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button><Button loading={saving} onClick={() => void save()}>{t('save')}</Button></>}>
        <div className="service-form">
          <SelectField id="service-specialist" label={t('specialist')} value={String(form.specialist || '')} options={specialists.map((item) => ({ value: String(item.id), label: `${item.full_name} · ${item.branch_name}` }))} onChange={(value) => setForm((item) => ({ ...item, specialist: Number(value) }))} required />
          <TextField id="service-name" name="name" label={t('serviceName')} value={form.name} onChange={(value) => setForm((item) => ({ ...item, name: value }))} required />
          <div className="form-grid form-grid--three">
            <TextField id="service-duration" name="duration_minutes" label={t('durationMinutes')} value={String(form.duration_minutes)} onChange={(value) => setForm((item) => ({ ...item, duration_minutes: Number(value) }))} type="number" inputMode="numeric" required />
            <TextField id="service-price" name="price" label={t('price')} value={form.price} onChange={(value) => setForm((item) => ({ ...item, price: value }))} type="number" inputMode="numeric" required />
            <SelectField id="service-currency" label={t('currency')} value={form.currency} options={[{ value: 'KZT', label: 'KZT' }, { value: 'RUB', label: 'RUB' }, { value: 'USD', label: 'USD' }]} onChange={(value) => setForm((item) => ({ ...item, currency: value }))} />
          </div>
          <TextField id="service-description" name="description" label={t('serviceDescription')} value={form.description} onChange={(value) => setForm((item) => ({ ...item, description: value }))} multiline rows={4} />
          <Checkbox label={t('active')} checked={form.is_active} onChange={(value) => setForm((item) => ({ ...item, is_active: value }))} />
        </div>
      </Dialog>
    </section>
  )
}
