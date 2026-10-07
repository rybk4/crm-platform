import { useLocale } from '@/lib/i18n/LocaleContext'
import { Icon } from '@/ui/Icon'
import { IconButton } from '@/ui/IconButton'
import { supportedImageAccept } from '../model'
import { takeFiles } from '@/lib/browser/takeInputFiles'
import type { OrganizationPhotosProps } from './OrganizationPhotos.types'
export type { OrganizationPhotosProps } from './OrganizationPhotos.types'

export function OrganizationPhotos({ photos, onAdd, onRemove }: OrganizationPhotosProps) {
  const { t } = useLocale()

  return (
    <div className="organization-photos">
      {photos.map((url, index) => (
        <div key={url} className="organization-photo">
          <img src={url} alt={t('settingsPhotoAlt', { number: index + 1 })} />
          <div className="organization-image-overlay">
            <IconButton
              ariaLabel={t('settingsRemovePhoto', { number: index + 1 })}
              onClick={() => onRemove(url)}
            >
              <Icon name="trash" />
            </IconButton>
          </div>
        </div>
      ))}

      <label className="organization-photo organization-image-add">
        <input
          className="organization-image-add__input"
          type="file"
          accept={supportedImageAccept}
          multiple
          onChange={(event) => onAdd(takeFiles(event))}
        />
        <Icon name="image" size={32} />
        <span>{t('settingsAddPhoto')}</span>
      </label>
    </div>
  )
}
