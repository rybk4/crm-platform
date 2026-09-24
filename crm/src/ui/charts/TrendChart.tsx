import { useState, type PointerEvent } from 'react'

import { useElementWidth } from '@/lib/browser/useElementWidth'
import {
  areaPath,
  axisTicks,
  labelStride,
  linePath,
  nearestIndex,
  niceCeil,
  plotPoints,
} from './chartGeometry'
import './charts.css'

export interface TrendPoint {
  label: string
  value: number
}

interface TrendChartProps {
  points: readonly TrendPoint[]
  ariaLabel: string
  formatValue: (value: number) => string
  /** Подпись отметки оси: короче значения в подсказке. */
  formatAxisValue?: (value: number) => string
  height?: number
}

const PADDING = { top: 12, right: 14, bottom: 26, left: 72 }

export function TrendChart({
  points,
  ariaLabel,
  formatValue,
  formatAxisValue = formatValue,
  height = 240,
}: TrendChartProps) {
  const { elementRef, width } = useElementWidth<HTMLDivElement>()
  const [activeIndex, setActiveIndex] = useState(-1)

  const values = points.map((point) => point.value)
  const max = niceCeil(Math.max(...values, 0))
  const plotted = plotPoints(values, { width, height }, PADDING, max)
  const baseline = height - PADDING.bottom
  const stride = labelStride(points.length, Math.max(Math.floor(width / 90), 2))
  const active = activeIndex >= 0 ? plotted[activeIndex] : null

  function handleMove(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    setActiveIndex(nearestIndex(plotted, event.clientX - bounds.left))
  }

  return (
    <div ref={elementRef} className="chart" style={{ height }}>
      {width > 0 ? (
        <svg
          className="chart__canvas"
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          onPointerMove={handleMove}
          onPointerLeave={() => setActiveIndex(-1)}
        >
          {axisTicks(max).map((tick) => {
            const y = PADDING.top + (baseline - PADDING.top) * (1 - tick / (max || 1))
            return (
              <g key={tick}>
                <line
                  className="chart__grid"
                  x1={PADDING.left}
                  x2={width - PADDING.right}
                  y1={y}
                  y2={y}
                />
                <text
                  className="chart__axis-label"
                  x={PADDING.left - 10}
                  y={y + 4}
                  textAnchor="end"
                >
                  {formatAxisValue(tick)}
                </text>
              </g>
            )
          })}

          <path className="chart__area" d={areaPath(plotted, baseline)} />
          <path className="chart__line" d={linePath(plotted)} />

          {points.map((point, index) =>
            index % stride === 0 ? (
              <text
                key={point.label}
                className="chart__axis-label"
                x={plotted[index].x}
                y={height - 8}
                textAnchor="middle"
              >
                {point.label}
              </text>
            ) : null,
          )}

          {active ? (
            <g>
              <line
                className="chart__crosshair"
                x1={active.x}
                x2={active.x}
                y1={PADDING.top}
                y2={baseline}
              />
              <circle className="chart__marker" cx={active.x} cy={active.y} r={5} />
            </g>
          ) : null}
        </svg>
      ) : null}

      {active ? (
        <div
          className="chart__tooltip"
          role="status"
          data-flip={active.x > width / 2}
          style={{ left: active.x, top: Math.max(active.y - 12, 0) }}
        >
          <strong>{formatValue(points[activeIndex].value)}</strong>
          <span>{points[activeIndex].label}</span>
        </div>
      ) : null}
    </div>
  )
}
