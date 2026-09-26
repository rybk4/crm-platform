import { useLocale } from '@/lib/i18n/LocaleContext'
import { Avatar } from '@/ui/Avatar'
import { Button } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { specialistInitials } from '../model'
import type { Specialist } from '../types'

interface SpecialistProfileHeaderProps {
  specialist: Specialist
  onBack: () => void
  onEdit: () => void
}

export function SpecialistProfileHeader({
  specialist,
  onBack,
  onEdit,
}: SpecialistProfileHeaderProps) {
  const { t } = useLocale()

  return (
    <header className="specialist-profile-header">
      <Button kind="quiet" startIcon={<Icon name="chevron-left" />} onClick={onBack}>
        {t('backToSpecialists')}
      </Button>

      <div className="specialist-profile-header__main">
        <Avatar
          className="specialist-profile-header__avatar"
          label={specialist.full_name}
          value={specialistInitials(specialist)}
          src={specialist.photo_url}
        />
        <div className="specialist-profile-header__copy">
          <h1>{specialist.full_name}</h1>
          <p>{specialist.phone_number}</p>
        </div>
        <Button kind="outline" startIcon={<Icon name="edit" />} onClick={onEdit}>
          {t('edit')}
        </Button>
      </div>
    </header>
  )
}
