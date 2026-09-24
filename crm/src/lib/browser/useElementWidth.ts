import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Ширина элемента в пикселях: графикам нужна реальная ширина, иначе
 * SVG приходится растягивать и он искажает штрихи и точки.
 */
export function useElementWidth<T extends HTMLElement>() {
  const elementRef = useRef<T | null>(null)
  const [width, setWidth] = useState(0)

  const measure = useCallback(() => {
    const element = elementRef.current
    if (element) setWidth(element.clientWidth)
  }, [])

  useEffect(() => {
    measure()

    const element = elementRef.current
    // В jsdom и старых браузерах наблюдателя нет — остаётся разовый замер.
    if (!element || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [measure])

  return { elementRef, width }
}
