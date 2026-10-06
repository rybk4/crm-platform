import { useState } from 'react'

import { parseEntityId } from '@/lib/api/entityId'
import { arrangeClients, pageCount, pageItems } from '../model'
import type { ClientSort } from '../model'
import type { Client, ClientListFilters } from '../types'

/** Черновик панели фильтров — строки, как в полях; в запрос уходит после «Применить». */
export interface ClientFilterDraft {
  visit_date: string
  service: string
  status: '' | NonNullable<ClientListFilters['status']>
}

const emptyDraft: ClientFilterDraft = { visit_date: '', service: '', status: '' }

function draftToFilters(draft: ClientFilterDraft): ClientListFilters {
  return {
    visit_date: draft.visit_date || undefined,
    service: draft.service ? parseEntityId(draft.service) : undefined,
    status: draft.status || undefined,
  }
}

/** Поиск, сортировка, страница и панель фильтров списка клиентов. */
export function useClientFilters() {
  const [search, setSearchValue] = useState('')
  const [sort, setSortValue] = useState<ClientSort>('none')
  const [page, setPage] = useState(1)
  const [panelOpen, setPanelOpen] = useState(false)
  const [draft, setDraft] = useState<ClientFilterDraft>(emptyDraft)
  const [applied, setApplied] = useState<ClientFilterDraft>(emptyDraft)

  function setSearch(value: string) {
    setSearchValue(value)
    setPage(1)
  }

  function setSort(value: ClientSort) {
    setSortValue(value)
    setPage(1)
  }

  function patchDraft(changes: Partial<ClientFilterDraft>) {
    setDraft((current) => ({ ...current, ...changes }))
  }

  function apply() {
    setApplied(draft)
    setPage(1)
    setPanelOpen(false)
  }

  function reset() {
    setDraft(emptyDraft)
    setApplied(emptyDraft)
    setPage(1)
    setPanelOpen(false)
  }

  function view(clients: readonly Client[]) {
    const arranged = arrangeClients(clients, search, sort)
    const pages = pageCount(arranged.length)
    const current = Math.min(page, pages)
    return { total: arranged.length, pages, page: current, items: pageItems(arranged, current) }
  }

  return {
    search,
    setSearch,
    sort,
    setSort,
    setPage,
    panelOpen,
    openPanel: () => setPanelOpen(true),
    closePanel: () => setPanelOpen(false),
    draft,
    patchDraft,
    apply,
    reset,
    activeCount: Object.values(applied).filter(Boolean).length,
    query: draftToFilters(applied),
    view,
  }
}
