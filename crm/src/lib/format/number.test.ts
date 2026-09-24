import { describe, expect, it } from 'vitest'

import { formatCompactNumber, formatDecimal, formatPercent } from './number'

describe('formatCompactNumber', () => {
  it('сокращает большие числа', () => {
    expect(formatCompactNumber(1250000)).not.toBe('1250000')
  })

  it('по умолчанию не оставляет дробную часть', () => {
    expect(formatCompactNumber(187500)).not.toContain(',')
  })

  it('не падает на нечисловом значении', () => {
    expect(formatCompactNumber(Number.NaN)).toBe('0')
  })
})

describe('formatDecimal', () => {
  it('ставит разделитель по правилам локали', () => {
    expect(formatDecimal(3.5)).toMatch(/^3[.,]5$/)
  })

  it('округляет до заданной точности', () => {
    expect(formatDecimal(3.55, 1)).toMatch(/^3[.,]6$/)
    expect(formatDecimal(3.5, 0)).toBe('4')
  })

  it('не падает на нечисловом значении', () => {
    expect(formatDecimal(Number.NaN)).toBe('0')
  })
})

describe('formatPercent', () => {
  it('округляет до целых', () => {
    expect(formatPercent(66.6)).toBe('67%')
  })
})
