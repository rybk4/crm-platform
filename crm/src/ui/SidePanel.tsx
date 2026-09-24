import Drawer from '@mui/material/Drawer'
import type { ReactNode } from 'react'

import { Icon } from './Icon'
import { IconButton } from './IconButton'
import './side-panel.css'

interface SidePanelProps {
  open: boolean
  title: string
  closeLabel: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}

export function SidePanel({ open, title, closeLabel, children, onClose, footer }: SidePanelProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className="side-panel">
        <div className="side-panel__header">
          <h2>{title}</h2>
          <IconButton ariaLabel={closeLabel} title={closeLabel} onClick={onClose}>
            <Icon name="close" />
          </IconButton>
        </div>
        <div className="side-panel__body">{children}</div>
        {footer ? <div className="side-panel__footer">{footer}</div> : null}
      </div>
    </Drawer>
  )
}
