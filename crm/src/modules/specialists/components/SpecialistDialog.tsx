import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Branch } from '@/modules/organizations/types'
import { Button } from '@/ui/Button'
import { Checkbox } from '@/ui/Checkbox'
import { Dialog } from '@/ui/Dialog'
import { SelectField } from '@/ui/SelectField'
import { TextField } from '@/ui/TextField'
import type { useSpecialistDialog } from '../hooks/useSpecialistDialog'
import { CertificateList } from './CertificateList'
import { ScheduleEditor } from './ScheduleEditor'

interface SpecialistDialogProps {
  dialog: ReturnType<typeof useSpecialistDialog>
  branches: Branch[]
  saving: boolean
}

export function SpecialistDialog({ dialog, branches, saving }: SpecialistDialogProps) {
  const { t } = useLocale()
  const { form, patch } = dialog

  return (
    <Dialog
      open={dialog.open}
      title={dialog.editing ? t('editSpecialist') : t('addSpecialist')}
      onClose={() => !saving && dialog.close()}
      actions={
        <>
          <Button kind="quiet" onClick={dialog.close}>
            {t('cancel')}
          </Button>
          <Button loading={saving} onClick={() => void dialog.submit()}>
            {t('save')}
          </Button>
        </>
      }
    >
      <div className="specialist-form">
        <section className="form-section">
          <SelectField
            id="specialist-branch"
            label={t('branch')}
            value={String(form.branch || '')}
            options={branches.map((branch) => ({ value: String(branch.id), label: branch.name }))}
            onChange={(value) => patch({ branch: Number(value) })}
            required
          />

          <div className="form-grid form-grid--three">
            <TextField
              id="specialist-last-name"
              name="last_name"
              label={t('lastName')}
              value={form.last_name}
              onChange={(value) => patch({ last_name: value })}
              required
            />
            <TextField
              id="specialist-first-name"
              name="first_name"
              label={t('firstName')}
              value={form.first_name}
              onChange={(value) => patch({ first_name: value })}
              required
            />
            <TextField
              id="specialist-middle-name"
              name="middle_name"
              label={t('middleName')}
              value={form.middle_name}
              onChange={(value) => patch({ middle_name: value })}
            />
          </div>

          <div className="form-grid">
            <TextField
              id="specialist-job-title"
              name="job_title"
              label={t('jobTitle')}
              value={form.job_title}
              onChange={(value) => patch({ job_title: value })}
            />
            <TextField
              id="specialist-phone"
              name="phone_number"
              label={t('phone')}
              value={form.phone_number}
              onChange={(value) => patch({ phone_number: value })}
              type="tel"
              inputMode="tel"
            />
          </div>

          <TextField
            id="specialist-photo"
            name="photo_url"
            label={t('photoUrl')}
            value={form.photo_url}
            onChange={(value) => patch({ photo_url: value })}
            type="url"
          />
          <TextField
            id="specialist-bio"
            name="bio"
            label={t('bio')}
            value={form.bio}
            onChange={(value) => patch({ bio: value })}
            multiline
            rows={3}
          />
          <Checkbox
            label={t('active')}
            checked={form.is_active}
            onChange={(value) => patch({ is_active: value })}
          />
        </section>

        <section className="form-section">
          <h3>{t('schedule')}</h3>
          <ScheduleEditor schedule={form.schedule} onChange={dialog.patchScheduleDay} />
        </section>

        <section className="form-section">
          <CertificateList
            certificates={form.certificates}
            onAdd={dialog.addCertificate}
            onChange={dialog.patchCertificate}
            onRemove={dialog.removeCertificate}
          />
        </section>
      </div>
    </Dialog>
  )
}
