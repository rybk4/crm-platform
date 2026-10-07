import type { useClientFilters } from '../hooks/useClientFilters'

export interface ClientsToolsProps {
  filters: ReturnType<typeof useClientFilters>
  onAdd: () => void
}
