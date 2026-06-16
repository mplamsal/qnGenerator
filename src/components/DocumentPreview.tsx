import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ExamDocumentHeader, ExamQuestionsBody } from './ExamDocumentContent'
import type { PaperMetadata, Question as PaperQuestion } from '../types/paper'

export const A4_WIDTH = 794
export const A4_HEIGHT = 1123

const MIN_ZOOM = 0.5
const MAX_ZOOM = 2
const ZOOM_STEP = 0.1

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function A4Frame({
  children,
  scale,
}: {
  children: React.ReactNode
  scale: number
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const [pageHeight, setPageHeight] = useState(A4_HEIGHT)

  useEffect(() => {
    const viewport = viewportRef.current
    const page = pageRef.current
    if (!viewport || !page) return

    const update = () => {
      setPageHeight(Math.max(page.scrollHeight, A4_HEIGHT))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(viewport)
    ro.observe(page)
    return () => ro.disconnect()
  }, [children, scale])

  return (
    <div ref={viewportRef} className="a4-viewport" title="Scroll to view the full A4 page">
      <div className="a4-viewport-inner">
        <div
          className="a4-scale-slot"
          style={{ width: A4_WIDTH * scale, height: pageHeight * scale }}
        >
          <div
            className="a4-scale-layer"
            style={{
              width: A4_WIDTH,
              transform: `scale(${scale})`,
            }}
          >
            <div ref={pageRef} className="doc-page">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DocumentPreview({
  metadata,
  questions,
}: {
  metadata: any
  questions: any[]
}) {
  const [scale, setScale] = useState(0.72)
  const manualZoomRef = useRef(false)
  const viewportSizerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = viewportSizerRef.current
    if (!el) return

    const fitToWidth = () => {
      if (manualZoomRef.current) return
      const padding = 48
      const availW = el.clientWidth - padding
      const fitWidth = availW / A4_WIDTH
      setScale(clampZoom(Math.max(0.72, Math.min(1, fitWidth))))
    }

    fitToWidth()
    const ro = new ResizeObserver(fitToWidth)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const zoomIn = useCallback(() => {
    manualZoomRef.current = true
    setScale((s) => clampZoom(Math.round((s + ZOOM_STEP) * 10) / 10))
  }, [])

  const zoomOut = useCallback(() => {
    manualZoomRef.current = true
    setScale((s) => clampZoom(Math.round((s - ZOOM_STEP) * 10) / 10))
  }, [])

  const zoomPct = Math.round(scale * 100)

  return (
    <>
      <div className="preview-toolbar">
        <span>📄 Document Preview</span>
        <div className="preview-zoom-controls">
          <button
            type="button"
            className="preview-zoom-btn"
            onClick={zoomOut}
            disabled={scale <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="preview-zoom-value">{zoomPct}%</span>
          <button
            type="button"
            className="preview-zoom-btn"
            onClick={zoomIn}
            disabled={scale >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>
      <div ref={viewportSizerRef} className="a4-viewport-sizer">
        <A4Frame scale={scale}>
          <ExamDocumentHeader metadata={metadata as Partial<PaperMetadata>} />
          <div className="doc-body">
            <ExamQuestionsBody questions={questions as PaperQuestion[]} />
          </div>
        </A4Frame>
      </div>
    </>
  )
}
