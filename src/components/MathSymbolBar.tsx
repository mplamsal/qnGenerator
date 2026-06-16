import React, { useRef } from 'react'

const MATH_SYMBOLS = [
  { label: '√', value: '√' },
  { label: 'x²', value: '²' },
  { label: 'x³', value: '³' },
  { label: 'π', value: 'π' },
  { label: '±', value: '±' },
  { label: '×', value: '×' },
  { label: '÷', value: '÷' },
  { label: '≤', value: '≤' },
  { label: '≥', value: '≥' },
  { label: '≠', value: '≠' },
  { label: '∞', value: '∞' },
  { label: '°', value: '°' },
  { label: '∠', value: '∠' },
  { label: 'θ', value: 'θ' },
  { label: '½', value: '½' },
  { label: '¼', value: '¼' },
  { label: '∑', value: '∑' },
  { label: '∫', value: '∫' },
  { label: 'Δ', value: 'Δ' },
  { label: 'a/b', value: '()/()' },
]

type Props = {
  onInsert: (symbol: string, input: HTMLTextAreaElement | HTMLInputElement) => void
  targetRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>
}

export default function MathSymbolBar({ onInsert, targetRef }: Props) {
  const barRef = useRef<HTMLDivElement>(null)

  return (
    <div className="math-symbol-bar" ref={barRef}>
      <span className="math-symbol-label">Math</span>
      {MATH_SYMBOLS.map((sym) => (
        <button
          key={sym.label}
          type="button"
          className="math-symbol-btn"
          title={`Insert ${sym.value}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const el = targetRef.current
            if (el) onInsert(sym.value, el)
          }}
        >
          {sym.label}
        </button>
      ))}
    </div>
  )
}

export function insertAtCursor(
  el: HTMLTextAreaElement | HTMLInputElement,
  text: string,
  onChange: (value: string) => void
) {
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? el.value.length
  const next = el.value.slice(0, start) + text + el.value.slice(end)
  onChange(next)
  requestAnimationFrame(() => {
    el.focus()
    const pos = start + text.length
    el.setSelectionRange(pos, pos)
  })
}
