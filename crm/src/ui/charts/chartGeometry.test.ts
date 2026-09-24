import { describe, expect, it } from 'vitest'

import {
  areaPath,
  axisTicks,
  labelStride,
  linePath,
  nearestIndex,
  niceCeil,
  plotPoints,
} from './chartGeometry'

const size = { width: 100, height: 100 }
const padding = { top: 0, right: 0, bottom: 0, left: 0 }

describe('niceCeil', () => {
  it('округляет вверх до круглого значения', () => {
    expect(niceCeil(87)).toBe(100)
    expect(niceCeil(12)).toBe(20)
    expect(niceCeil(230)).toBe(250)
  })

  it('не возвращает ноль на пустых данных', () => {
    expect(niceCeil(0)).toBe(1)
    expect(niceCeil(-5)).toBe(1)
  })
})

describe('plotPoints', () => {
  it('растягивает точки на всю ширину', () => {
    const points = plotPoints([0, 50, 100], size, padding, 100)

    expect(points[0]).toEqual({ x: 0, y: 100 })
    expect(points[2]).toEqual({ x: 100, y: 0 })
  })

  it('ставит единственную точку по центру', () => {
    expect(plotPoints([10], size, padding, 10)[0].x).toBe(50)
  })

  it('прижимает значения к низу при нулевом максимуме', () => {
    expect(plotPoints([0, 0], size, padding, 0)[0].y).toBe(100)
  })
})

describe('пути и подписи', () => {
  it('строит линию и замкнутую заливку', () => {
    const points = plotPoints([0, 100], size, padding, 100)

    expect(linePath(points)).toBe('M0 100 L100 0')
    expect(areaPath(points, 100)).toContain('Z')
  })

  it('возвращает пустой путь без точек', () => {
    expect(linePath([])).toBe('')
    expect(areaPath([], 10)).toBe('')
  })

  it('находит ближайшую к курсору точку', () => {
    const points = plotPoints([1, 2, 3], size, padding, 3)

    expect(nearestIndex(points, 0)).toBe(0)
    expect(nearestIndex(points, 99)).toBe(2)
    expect(nearestIndex([], 10)).toBe(-1)
  })

  it('прореживает подписи, когда их больше, чем помещается', () => {
    expect(labelStride(5, 6)).toBe(1)
    expect(labelStride(30, 6)).toBe(5)
  })

  it('делит ось на равные отметки', () => {
    expect(axisTicks(100, 4)).toEqual([0, 25, 50, 75, 100])
  })
})
