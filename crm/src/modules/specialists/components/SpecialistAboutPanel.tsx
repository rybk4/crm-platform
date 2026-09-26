import { useLocale } from '@/lib/i18n/LocaleContext'
import { Avatar } from '@/ui/Avatar'
import { Icon } from '@/ui/Icon'
import { specialistInitials } from '../model'
import type { Specialist } from '../types'

interface SpecialistAboutPanelProps {
  specialist: Specialist
}

interface ProfileFieldProps {
  label: string
  value: string
}

function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div className="specialist-profile-field">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  )
}

export function SpecialistAboutPanel({ specialist }: SpecialistAboutPanelProps) {
  const { t } = useLocale()

  return (
    <div className="specialist-about">
      <section className="specialist-about__section">
        <h2>{t('specialist')}</h2>
        <div className="specialist-about__profile">
          <div className="specialist-about__photo">
            <Avatar
              label={specialist.full_name}
              value={specialistInitials(specialist)}
              src={specialist.photo_url}
            />
          </div>
          <div className="specialist-about__fields">
            <ProfileField label={t('lastName')} value={specialist.last_name} />
            <ProfileField label={t('firstName')} value={specialist.first_name} />
            <ProfileField label={t('middleName')} value={specialist.middle_name} />
          </div>
          <div className="specialist-about__fields">
            <ProfileField label={t('phone')} value={specialist.phone_number} />
            <ProfileField label={t('branch')} value={specialist.branch_name} />
            <ProfileField label={t('jobTitle')} value={specialist.job_title} />
          </div>
        </div>
      </section>

      <section className="specialist-about__section">
        <h2>{t('specialty')}</h2>
        <div className="specialist-about__chips">
          <span>{specialist.job_title || t('positionNotSet')}</span>
        </div>
      </section>

      <section className="specialist-about__section">
        <h2>{t('additionalInformation')}</h2>
        <div className="specialist-about__bio">{specialist.bio || t('specialistBioEmpty')}</div>
      </section>

      <section className="specialist-about__section">
        <h2>{t('certificates')}</h2>
        <p>{t('certificatesHint')}</p>
        <div className="specialist-about__certificates">
          {specialist.certificates.length ? (
            specialist.certificates.map((certificate) => (
              <div key={certificate.id ?? certificate.title}>
                <Icon name="check-circle" />
                <span>{certificate.title}</span>
              </div>
            ))
          ) : (
            <span>{t('certificatesEmpty')}</span>
          )}
        </div>
      </section>
    </div>
  )
}
