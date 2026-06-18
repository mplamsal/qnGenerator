import { useState, useCallback, type RefObject } from 'react'

type Options = {
  initial?: number
  min?: number
  max?: number
}

export function useSplitterDrag(
  containerRef: RefObject<HTMLDivElement>,
  { initial = 50, min = 18, max = 78 }: Options = {}
) {
  const [pct, setPct] = useState(initial)
  const [isDragging, setIsDragging] = useState(false)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      const handleMove = (ev: MouseEvent) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const newPct = ((ev.clientX - rect.left) / rect.width) * 100
        setPct(Math.min(max, Math.max(min, newPct)))
      }

      const handleUp = () => {
        setIsDragging(false)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleUp)
      }

      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
    },
    [containerRef, min, max]
  )

  return { pct, isDragging, onMouseDown }
}
