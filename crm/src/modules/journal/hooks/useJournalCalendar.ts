import { useState } from 'react'
import { fromDayKey, dayKey } from '@/lib/datetime/day'
import type { JournalDateRange } from '../calendarModel'
export function useJournalCalendar(
  date: string,
  range: boolean,
  onSelect: (date: string) => void,
  onRange: (range: JournalDateRange) => void,
) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [month, setMonth] = useState(date)
  const [from, setFrom] = useState<string | null>(null)
  function open(element: HTMLElement) {
    setMonth(date)
    setFrom(null)
    setAnchor(element)
  }
  function move(offset: number) {
    const next = fromDayKey(month)
    next.setDate(1)
    next.setMonth(next.getMonth() + offset)
    setMonth(dayKey(next))
  }
  function select(value: string) {
    if (range && !from) {
      setFrom(value)
      return
    }
    if (range && from)
      onRange({ from: from < value ? from : value, to: from < value ? value : from })
    else onSelect(value)
    setAnchor(null)
  }
  return { anchor, month, from, open, move, select, close: () => setAnchor(null) }
}
