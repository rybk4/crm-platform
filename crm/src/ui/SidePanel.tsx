import { useId } from 'react'
import Drawer from '@mui/material/Drawer'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Icon } from './Icon'
import { IconButton } from './IconButton'
import type { SidePanelProps } from './SidePanel.types'
export type { SidePanelProps } from './SidePanel.types'

import './side-panel.css'

export function SidePanel({
  open,
  title,
  children,
  onClose,
  tone,
  footer,
  closeLabel,
  floating = false,
}: SidePanelProps) {
  const { t } = useLocale()
  const titleId = useId()
  return (
    <Drawer
      anchor="right"
      container={() => document.querySelector('.app-theme-root')}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: floating ? 'side-panel side-panel--floating' : 'side-panel',
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
        },
        backdrop: { className: floating ? 'side-panel__backdrop' : undefined },
      }}
    >
      <header className="side-panel__header">
        <h2 id={titleId}>{title}</h2>
        <IconButton ariaLabel={closeLabel ?? t('close')} onClick={onClose}>
          <Icon name="close" />
        </IconButton>
      </header>
      {tone ? <div className="side-panel__status" data-tone={tone} /> : null}
      <div className="side-panel__body">{children}</div>
      <footer className="side-panel__footer">{footer}</footer>
    </Drawer>
  )
}
