import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { IconButton } from '@/ui/IconButton'
import { TextField } from '@/ui/TextField'
import type { SpecialistCertificate } from '../types'

interface CertificateListProps {
  certificates: SpecialistCertificate[]
  onAdd: () => void
  onChange: (index: number, changes: Partial<SpecialistCertificate>) => void
  onRemove: (index: number) => void
}

export function CertificateList({ certificates, onAdd, onChange, onRemove }: CertificateListProps) {
  const { t } = useLocale()

  return (
    <>
      <div className="form-section__heading">
        <h3>{t('certificates')}</h3>
        <Button kind="outline" onClick={onAdd}>
          {t('addCertificate')}
        </Button>
      </div>

      {certificates.map((certificate, index) => (
        <div className="certificate-row" key={certificate.id ?? index}>
          <TextField
            id={`certificate-title-${index}`}
            name={`certificate-title-${index}`}
            label={t('certificateTitle')}
            value={certificate.title}
            onChange={(value) => onChange(index, { title: value })}
          />
          <TextField
            id={`certificate-url-${index}`}
            name={`certificate-url-${index}`}
            label={t('certificateUrl')}
            value={certificate.image_url}
            onChange={(value) => onChange(index, { image_url: value })}
            type="url"
          />
          <IconButton ariaLabel={t('delete')} onClick={() => onRemove(index)}>
            <Icon name="trash" />
          </IconButton>
        </div>
      ))}
    </>
  )
}
