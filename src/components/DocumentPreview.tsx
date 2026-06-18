import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { PaperMetadata, Question } from '../types/paper'
import type { TemplateDefinition } from '../templates/types'

const PORTRAIT_W = 794
const PORTRAIT_H = 1123
const LANDSCAPE_W = 1123
const LANDSCAPE_H = 794

const MIN_ZOOM = 0.4
const MAX_ZOOM = 2
const ZOOM_STEP = 0.1

function clampZoom(v: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v))
}

function A4Frame({
  children,
  scale,
  orientation,
}: {
  children: React.ReactNode
  scale: number
  orientation?: 'portrait' | 'landscape'
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  const pageW = orientation === 'landscape' ? LANDSCAPE_W : PORTRAIT_W
  const pageH = orientation === 'landscape' ? LANDSCAPE_H : PORTRAIT_H

  const [pageHeight, setPageHeight] = useState(pageH)

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    const update = () => setPageHeight(Math.max(page.scrollHeight, pageH))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(page)
    return () => ro.disconnect()
  }, [children, scale, pageH])

  return (
    <div ref={viewportRef} className="a4-viewport">
      <div className="a4-viewport-inner">
        <div
          className="a4-scale-slot"
          style={{ width: pageW * scale, height: pageHeight * scale }}
        >
          <div
            className="a4-scale-layer"
            style={{ width: pageW, transform: `scale(${scale})` }}
          >
            {/* No doc-page here — TemplatePreviewRenderer renders its own .doc-page */}
            <div ref={pageRef} style={{ width: pageW }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DocumentPreview({
  template,
  metadata,
  questions,
}: {
  template: TemplateDefinition
  metadata?: Partial<PaperMetadata>
  questions?: Question[]
}) {
  const [scale, setScale] = useState(0.72)
  const manualZoomRef = useRef(false)
  const viewportSizerRef = useRef<HTMLDivElement>(null)
  const TemplateContent = template.PreviewComponent
  const orientation = template.orientation ?? 'portrait'
  const pageW = orientation === 'landscape' ? LANDSCAPE_W : PORTRAIT_W

  useEffect(() => {
    const el = viewportSizerRef.current
    if (!el) return

    const fitToWidth = () => {
      if (manualZoomRef.current) return
      const padding = 48
      const available = el.clientWidth - padding
      const fit = Math.max(0.4, Math.min(1, available / pageW))
      setScale(clampZoom(fit))
    }

    fitToWidth()
    const ro = new ResizeObserver(fitToWidth)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pageW])

  const zoomIn = useCallback(() => {
    manualZoomRef.current = true
    setScale((s) => clampZoom(Math.round((s + ZOOM_STEP) * 10) / 10))
  }, [])

  const zoomOut = useCallback(() => {
    manualZoomRef.current = true
    setScale((s) => clampZoom(Math.round((s - ZOOM_STEP) * 10) / 10))
  }, [])

  return (
    <>
      <div className="preview-toolbar">
        <span style={{ fontSize: 13, color: '#5f6368' }}>Document Preview</span>
        <div className="preview-zoom-controls">
          <button
            type="button"
            className="preview-zoom-btn"
            onClick={zoomOut}
            disabled={scale <= MIN_ZOOM}
            aria-label="Zoom out"
          >−</button>
          <span className="preview-zoom-value">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            className="preview-zoom-btn"
            onClick={zoomIn}
            disabled={scale >= MAX_ZOOM}
            aria-label="Zoom in"
          >+</button>
        </div>
      </div>
      <div ref={viewportSizerRef} className="a4-viewport-sizer">
        <A4Frame scale={scale} orientation={orientation}>
          <TemplateContent metadata={metadata} questions={questions} />
        </A4Frame>
      </div>
    </>
  )
}
