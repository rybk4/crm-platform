import type { PageHeaderProps } from './PageHeader.types'
export type { PageHeaderProps } from './PageHeader.types'

import './page-header.css'

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  )
}
