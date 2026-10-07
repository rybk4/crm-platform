import { Link } from 'react-router-dom'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { Card } from '@/ui/Card'
import { Icon } from '@/ui/Icon'
import { PageHeader } from '@/ui/PageHeader'
import type { HelpPageProps } from './HelpPage.types'
export type { HelpPageProps } from './HelpPage.types'

import './help.css'

const tutorialSteps = [
  { title: 'tutorialJournalTitle', text: 'tutorialJournalText', path: '/journal' },
  { title: 'tutorialCatalogTitle', text: 'tutorialCatalogText', path: '/services' },
  { title: 'tutorialClientsTitle', text: 'tutorialClientsText', path: '/clients' },
] as const

export function HelpPage({ kind }: HelpPageProps) {
  const { t } = useLocale()

  if (kind === 'tutorial') {
    return (
      <section className="help-page">
        <PageHeader title={t('tutorialTitle')} description={t('tutorialDescription')} />
        <div className="help-grid">
          {tutorialSteps.map((step, index) => (
            <Card key={step.path} title={`${index + 1}. ${t(step.title)}`}>
              <p>{t(step.text)}</p>
              <Link to={step.path}>{t('tutorialOpenSection')}</Link>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  const phone = String(import.meta.env.VITE_SUPPORT_PHONE ?? '').replace(/\D/g, '')
  const message = encodeURIComponent(t('supportMessage'))

  return (
    <section className="help-page">
      <PageHeader title={t('supportTitle')} description={t('supportDescription')} />
      <div className="help-grid help-grid--support">
        <Card title={t('supportQuickHelp')} hint={t('supportQuickHelpHint')}>
          <ul>
            <li>{t('supportTipRefresh')}</li>
            <li>{t('supportTipBranch')}</li>
            <li>{t('supportTipStatus')}</li>
          </ul>
        </Card>
        <Card title={t('supportContact')} hint={t('supportContactHint')}>
          {phone ? (
            <a
              className="help-contact"
              href={`https://wa.me/${phone}?text=${message}`}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="phone" />
              {t('supportOpenWhatsapp')}
            </a>
          ) : (
            <p>{t('supportNotConfigured')}</p>
          )}
        </Card>
      </div>
    </section>
  )
}
