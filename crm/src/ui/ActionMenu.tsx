import { useState } from 'react'

import { useDismissOnOutside } from '@/lib/browser/useDismissOnOutside'
import type { IconName } from './Icon'
import { Icon } from './Icon'
import { IconButton } from './IconButton'
import './action-menu.css'

export interface ActionMenuItem {
  key: string
  label: string
  icon: IconName
  danger?: boolean
  onSelect: () => void
}

interface ActionMenuProps {
  label: string
  items: readonly ActionMenuItem[]
}

/** Кнопка «…» с выпадающим списком действий над записью. */
export function ActionMenu({ label, items }: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useDismissOnOutside<HTMLDivElement>(open, () => setOpen(false))

  return (
    <div className="ui-action-menu" ref={ref}>
      <IconButton
        className="ui-action-menu__trigger"
        ariaLabel={label}
        title={label}
        expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="more" size={22} />
      </IconButton>
      {open ? (
        <div className="ui-action-menu__list" role="menu">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              data-danger={item.danger || undefined}
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
            >
              <Icon name={item.icon} size={17} />
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
