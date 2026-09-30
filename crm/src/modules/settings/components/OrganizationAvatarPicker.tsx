import { useLocale } from '@/lib/i18n/LocaleContext'
import { Icon } from '@/ui/Icon'
import { IconButton } from '@/ui/IconButton'
import { supportedImageAccept } from '../model'
import { takeFiles } from '@/lib/browser/takeInputFiles'

interface OrganizationAvatarPickerProps {
  url: string | null
  name: string
  onPick: (file: File) => void
  onRemove: () => void
}

export function OrganizationAvatarPicker({
  url,
  name,
  onPick,
  onRemove,
}: OrganizationAvatarPickerProps) {
  const { t } = useLocale()

  if (url) {
    return (
      <div className="organization-avatar">
        <img src={url} alt={t('settingsAvatarAlt', { name })} />
        <div className="organization-image-overlay">
          <IconButton ariaLabel={t('settingsRemoveAvatar')} onClick={onRemove}>
            <Icon name="trash" />
          </IconButton>
        </div>
      </div>
    )
  }

  return (
    <label className="organization-avatar organization-image-add">
      <input
        className="organization-image-add__input"
        type="file"
        accept={supportedImageAccept}
        onChange={(event) => takeFiles(event).slice(0, 1).forEach(onPick)}
      />
      <Icon name="image" size={32} />
      <span>{t('settingsAddAvatar')}</span>
    </label>
  )
}
