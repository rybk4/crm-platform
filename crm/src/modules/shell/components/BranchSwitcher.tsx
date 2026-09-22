import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Branch } from '@/modules/organizations/types'

interface BranchSwitcherProps {
  branches: Branch[]
  activeBranchId: number | null
  loading: boolean
  disabled: boolean
  onSelect: (branchId: number) => void
}

export function BranchSwitcher({
  branches,
  activeBranchId,
  loading,
  disabled,
  onSelect,
}: BranchSwitcherProps) {
  const { t } = useLocale()

  return (
    <fieldset className="branch-switcher" disabled={disabled}>
      <legend>{t('activeBranch')}</legend>

      {loading ? <p role="status">{t('loading')}</p> : null}
      {!loading && branches.length === 0 ? <p>{t('noBranches')}</p> : null}

      <div className="branch-switcher__list">
        {branches.map((branch) => (
          <label
            key={branch.id}
            className="branch-option"
            data-selected={activeBranchId === branch.id}
          >
            <input
              type="radio"
              name="active-branch"
              value={branch.id}
              checked={activeBranchId === branch.id}
              onChange={() => onSelect(branch.id)}
            />
            <span className="branch-option__indicator" aria-hidden="true" />
            <span className="branch-option__copy">
              <strong>{branch.name}</strong>
              <small>{branch.address}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
