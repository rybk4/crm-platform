import { useState } from 'react'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { Checkbox } from '@/ui/Checkbox'
import { SidePanel } from '@/ui/SidePanel'
import { SelectField } from '@/ui/SelectField'
import { TextField } from '@/ui/TextField'
import { initialJournalSettings } from '../filterModel'
import type { JournalFiltersProps } from './JournalFilters.types'

export function JournalFilters({
  settings,
  services,
  specialists,
  onApply,
  onClose,
}: JournalFiltersProps) {
  const { t } = useLocale()
  const [draft, setDraft] = useState(settings)
  const [serviceSearch, setServiceSearch] = useState('')
  const [professionSearch, setProfessionSearch] = useState('')
  return (
    <SidePanel
      floating
      open
      title={t('journalFilters')}
      onClose={onClose}
      footer={
        <>
          <Button onClick={() => onApply(draft)}>{t('journalApply')}</Button>
          <Button kind="danger" onClick={() => onApply(initialJournalSettings)}>
            {t('journalReset')}
          </Button>
        </>
      }
    >
      <div className="journal-filters">
        <SelectField
          id="filter-interval"
          label={t('journalInterval')}
          value={String(draft.step)}
          options={[10, 15, 20, 25, 30, 60].map((value) => ({
            value: String(value),
            label: t('minutesShort', { count: value }),
          }))}
          onChange={(value) => setDraft({ ...draft, step: Number(value) })}
        />
        <fieldset>
          <legend>{t('journalServices')}</legend>
          <TextField
            id="filter-services-search"
            name="service-search"
            label={t('journalSearch')}
            value={serviceSearch}
            onChange={setServiceSearch}
          />
          <div className="journal-filters__options">
            {services
              .filter(
                (s) =>
                  s.is_active &&
                  s.name.toLocaleLowerCase().includes(serviceSearch.toLocaleLowerCase()),
              )
              .map((s) => (
                <Checkbox
                  key={s.id}
                  label={s.name}
                  checked={draft.services.includes(String(s.id))}
                  onChange={(checked) =>
                    setDraft({
                      ...draft,
                      services: checked
                        ? [...draft.services, String(s.id)]
                        : draft.services.filter((id) => id !== String(s.id)),
                    })
                  }
                />
              ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t('journalProfessions')}</legend>
          <TextField
            id="filter-professions-search"
            name="profession-search"
            label={t('journalSearch')}
            value={professionSearch}
            onChange={setProfessionSearch}
          />
          <div className="journal-filters__options">
            {[...new Set(specialists.map((s) => s.job_title))]
              .filter(
                (title) =>
                  title && title.toLocaleLowerCase().includes(professionSearch.toLocaleLowerCase()),
              )
              .map((title) => (
                <Checkbox
                  key={title}
                  label={title}
                  checked={draft.professions.includes(title)}
                  onChange={(checked) =>
                    setDraft({
                      ...draft,
                      professions: checked
                        ? [...draft.professions, title]
                        : draft.professions.filter((value) => value !== title),
                    })
                  }
                />
              ))}
          </div>
        </fieldset>
        <SelectField
          id="filter-presence"
          label={t('journalByAppointments')}
          value={draft.presence}
          options={[
            { value: '', label: t('allSpecialists') },
            { value: 'true', label: t('journalWithAppointments') },
            { value: 'false', label: t('journalWithoutAppointments') },
          ]}
          onChange={(presence) => setDraft({ ...draft, presence })}
        />
        <SelectField
          id="filter-sort"
          label={t('journalSorting')}
          value={draft.sort}
          options={[
            { value: '', label: t('journalNoSorting') },
            { value: 'name', label: t('journalSortName') },
            { value: 'profession', label: t('journalSortProfession') },
            { value: 'appointment', label: t('journalByAppointments') },
          ]}
          onChange={(sort) => setDraft({ ...draft, sort })}
        />
      </div>
    </SidePanel>
  )
}
