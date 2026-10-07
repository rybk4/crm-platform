import { useState } from 'react'

import { useDismissOnOutside } from '@/lib/browser/useDismissOnOutside'

import { Icon } from './Icon'
import { IconButton } from './IconButton'
import type { ActionMenuProps } from './ActionMenu.types'
export type { ActionMenuItem, ActionMenuProps } from './ActionMenu.types'

import './action-menu.css'

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
