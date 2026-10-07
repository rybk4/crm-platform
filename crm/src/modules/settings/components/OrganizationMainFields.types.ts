import type { useSettingsForm } from '../hooks/useSettingsForm'
import type { City } from '../types'

export interface OrganizationMainFieldsProps {
  settings: ReturnType<typeof useSettingsForm>
  cities: City[]
}
