export interface ChartPadding {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ChartPoint {
  x: number
  y: number
}

const NICE_STEPS = [1, 2, 2.5, 5, 10]

/** Верхняя граница оси: округляем вверх до «круглого» числа, иначе подписи рябят. */
export function niceCeil(value: number) {
  if (value <= 0) return 1

  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const step = NICE_STEPS.find((candidate) => normalized <= candidate) ?? 10

  return step * magnitude
}

export function axisTicks(max: number, count = 4) {
  return Array.from({ length: count + 1 }, (_, index) => (max / count) * index)
}

/** Точки графика в координатах SVG. Один столбик — один шаг по X. */
export function plotPoints(
  values: number[],
  size: { width: number; height: number },
  padding: ChartPadding,
  max: number,
): ChartPoint[] {
  const plotWidth = Math.max(size.width - padding.left - padding.right, 1)
  const plotHeight = Math.max(size.height - padding.top - padding.bottom, 1)
  const step = values.length > 1 ? plotWidth / (values.length - 1) : 0

  return values.map((value, index) => ({
    x: padding.left + (values.length > 1 ? step * index : plotWidth / 2),
    y: padding.top + plotHeight - (max > 0 ? Math.min(value / max, 1) * plotHeight : 0),
  }))
}

export function linePath(points: ChartPoint[]) {
  if (!points.length) return ''
  return points.map((point, index) => `${index ? 'L' : 'M'}${point.x} ${point.y}`).join(' ')
}

export function areaPath(points: ChartPoint[], baseline: number) {
  if (!points.length) return ''
  const first = points[0]
  const last = points[points.length - 1]
  return `${linePath(points)} L${last.x} ${baseline} L${first.x} ${baseline} Z`
}

/** Индекс ближайшей к курсору точки — для перекрестия и подсказки. */
export function nearestIndex(points: ChartPoint[], x: number) {
  if (!points.length) return -1

  return points.reduce((best, point, index) => {
    const bestDistance = Math.abs(points[best].x - x)
    return Math.abs(point.x - x) < bestDistance ? index : best
  }, 0)
}

/** Подписи оси X прореживаем: на узком графике все они не помещаются. */
export function labelStride(count: number, maxLabels: number) {
  if (count <= maxLabels) return 1
  return Math.ceil(count / maxLabels)
}
