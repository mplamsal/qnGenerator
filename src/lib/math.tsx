import React from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

type MathTextProps = { text: string }

// Simple parser: splits on inline $...$ math markers.
export function MathText({ text }: MathTextProps) {
  if (!text) return null

  const parts: Array<string | { math: string }> = []
  let lastIndex = 0
  const regex = /\$(.+?)\$/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const idx = match.index
    if (idx > lastIndex) parts.push(text.slice(lastIndex, idx))
    parts.push({ math: match[1] })
    lastIndex = idx + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))

  const unicodeSupMap: Record<string, string> = {
    '⁰': '0',
    '¹': '1',
    '²': '2',
    '³': '3',
    '⁴': '4',
    '⁵': '5',
    '⁶': '6',
    '⁷': '7',
    '⁸': '8',
    '⁹': '9',
  }

  function replaceUnicodeSup(s: string) {
    return s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (m) => '^{' + (unicodeSupMap[m] || m) + '}')
  }

  function normalizeMath(s: string) {
    let out = s.trim()
    out = replaceUnicodeSup(out)
    // convert a/b -> \frac{a}{b} for simple tokens
    out = out.replace(/\b([A-Za-z0-9()]+)\s*\/\s*([A-Za-z0-9()]+)\b/g, "\\frac{$1}{$2}")
    // convert x^2 -> x^{2}
    out = out.replace(/([A-Za-z0-9)}]+)\^([A-Za-z0-9{]+)/g, (m, a, b) => {
      if (b.startsWith('{')) return `${a}^${b}`
      return `${a}^{${b}}`
    })
    // sqrt and √
    out = out.replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}")
    out = out.replace(/√\(([^)]+)\)/g, "\\sqrt{$1}")
    out = out.replace(/√([A-Za-z0-9()]+)/g, "\\sqrt{$1}")
    return out
  }

  // If the whole text contains obvious math-like chars and no $...$, render as math
  const hasMathChars = /[√^\/²³¹¼½¾]|\\frac|sqrt\(|\^/.test(text)
  if (hasMathChars && !/\$/.test(text)) {
    const expr = normalizeMath(text)
    try {
      const html = katex.renderToString(expr, { throwOnError: false, displayMode: false })
      return <span dangerouslySetInnerHTML={{ __html: html }} />
    } catch (e) {
      return <span>{text}</span>
    }
  }

  return (
    <span>
      {parts.map((p, i) => {
        if (typeof p === 'string') return <span key={i}>{p}</span>
        try {
          const expr = normalizeMath(p.math)
          const html = katex.renderToString(expr, { throwOnError: false, displayMode: false })
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
        } catch (e) {
          return <span key={i}>{`$${p.math}$`}</span>
        }
      })}
    </span>
  )
}

export default MathText
