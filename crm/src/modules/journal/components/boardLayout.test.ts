import { describe, expect, it } from 'vitest'

import { boardHeightPx, heightPx, MINUTE_PX, offsetPx, rulerMarks } from './boardLayout'

const bounds = { open: 570, close: 1080, breakStart: null, breakEnd: null }

describe('сетка дня', () => {
  it('отсчитывает смещение от начала дня', () => {
    expect(offsetPx(570, bounds)).toBe(0)
    expect(offsetPx(630, bounds)).toBe(60 * MINUTE_PX)
  })

  it('не уводит карточку выше сетки', () => {
    expect(offsetPx(480, bounds)).toBe(0)
  })

  it('держит минимальную высоту короткой записи', () => {
    expect(heightPx(10)).toBe(28)
    expect(heightPx(60)).toBe(104)
  })

  it('считает высоту всей сетки', () => {
    expect(boardHeightPx(bounds)).toBe(510 * MINUTE_PX)
  })

  it('ставит отметки на круглых часах внутри дня', () => {
    expect(rulerMarks(bounds)).toEqual([
      570, 600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 900, 930, 960, 990, 1020, 1050,
    ])
  })
})
