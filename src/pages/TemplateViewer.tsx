import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DocumentPreview from '../components/DocumentPreview'
import PDFPreview from '../components/PDFPreview'
import QuestionEditor from '../components/QuestionEditor'
import type { PaperMetadata, Question } from '../types/paper'
import { createQuestion, DEFAULT_METADATA } from '../types/paper'
import type { TemplateDefinition } from '../templates/types'
import { builtInTemplateDefinitions } from '../templates/templateReader'

// ── Notebook Cell ─────────────────────────────────────────────────────────────

type CellProps = {
  question: Question
  index: number
  total: number
  expanded: boolean
  onToggle: () => void
  onChange: (q: Question) => void
  onRemove: (id: string) => void
  onMoveUp: (i: number) => void
  onMoveDown: (i: number) => void
}

function NotebookCell({ question, index, total, expanded, onToggle, onChange, onRemove, onMoveUp, onMoveDown }: CellProps) {
  const preview = question.question_text?.trim().slice(0, 60) || 'Click to edit…'

  return (
    <div className={`nb-cell${expanded ? ' nb-cell-open' : ''}`}>
      <div className="nb-cell-bar" onClick={onToggle}>
        <span className="nb-cell-num">Q{index + 1}</span>
        <span className="nb-cell-type">{question.type}</span>
        <span className="nb-cell-marks">{question.marks}m</span>
        <span className="nb-cell-preview">{preview}</span>
        <div className="nb-cell-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="nb-action-btn"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            title="Move up"
          >↑</button>
          <button
            type="button"
            className="nb-action-btn"
            onClick={() => onMoveDown(index)}
            disabled={index >= total - 1}
            title="Move down"
          >↓</button>
          <button
            type="button"
            className="nb-action-btn nb-action-remove"
            onClick={() => onRemove(question.id)}
            title="Delete"
          >✕</button>
          <button
            type="button"
            className="nb-action-btn nb-action-toggle"
            onClick={onToggle}
            title={expanded ? 'Collapse' : 'Expand'}
          >{expanded ? '∧' : '∨'}</button>
        </div>
      </div>

      {expanded && (
        <div className="nb-cell-body">
          <QuestionEditor
            item={question}
            index={index}
            canMoveDown={index < total - 1}
            onChange={onChange}
            onRemove={onRemove}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
        </div>
      )}
    </div>
  )
}

// ── Metadata Panel (collapsible) ─────────────────────────────────────────────

function MetaPanel({ metadata, onChange }: { metadata: PaperMetadata; onChange: (m: PaperMetadata) => void }) {
  const [open, setOpen] = useState(true)
  const set = (key: keyof PaperMetadata) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...metadata, [key]: e.target.value })

  return (
    <div className="nb-meta-panel">
      <button type="button" className="nb-section-header" onClick={() => setOpen((v) => !v)}>
        <span>Document Info</span>
        <span className="nb-section-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="nb-meta-fields">
          <div className="nb-field">
            <label>School Name</label>
            <input value={metadata.schoolName || ''} onChange={set('schoolName')} placeholder="School name" />
          </div>
          <div className="nb-field-row">
            <div className="nb-field">
              <label>Subject</label>
              <input value={metadata.subject} onChange={set('subject')} placeholder="e.g. Mathematics" />
            </div>
            <div className="nb-field">
              <label>Grade / Class</label>
              <input value={metadata.grade} onChange={set('grade')} placeholder="e.g. Grade 10" />
            </div>
          </div>
          <div className="nb-field-row">
            <div className="nb-field">
              <label>Exam Type</label>
              <input value={metadata.examType} onChange={set('examType')} placeholder="e.g. Final" />
            </div>
            <div className="nb-field">
              <label>Duration</label>
              <input value={metadata.duration} onChange={set('duration')} placeholder="e.g. 3 hours" />
            </div>
          </div>
          <div className="nb-field-row">
            <div className="nb-field">
              <label>Full Marks</label>
              <input value={metadata.fullMarks} onChange={set('fullMarks')} placeholder="e.g. 100" />
            </div>
            <div className="nb-field">
              <label>Academic Year</label>
              <input value={metadata.academicYear || ''} onChange={set('academicYear')} placeholder="e.g. 2024" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main TemplateViewer ───────────────────────────────────────────────────────

const QUESTION_TYPES: Question['type'][] = ['MCQ', 'Very Short', 'Short', 'Long']

export default function TemplateViewer() {
  const navigate = useNavigate()
  const location = useLocation()

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(builtInTemplateDefinitions[0]?.id ?? '')
  const [docName, setDocName] = useState('Untitled exam')
  const [metadata, setMetadata] = useState<PaperMetadata>({ ...DEFAULT_METADATA })
  const [questions, setQuestions] = useState<Question[]>([createQuestion('MCQ')])
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)
  const [leftPct, setLeftPct] = useState(28)

  // Load template from URL param
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tid = params.get('templateId')
    if (tid) {
      const found = builtInTemplateDefinitions.find((t) => t.id === tid)
      if (found) {
        setSelectedTemplateId(found.id)
        setDocName(found.name)
      }
    }
  }, [location.search])

  const activeTemplate = useMemo<TemplateDefinition | undefined>(
    () => builtInTemplateDefinitions.find((t) => t.id === selectedTemplateId),
    [selectedTemplateId]
  )

  // Question management
  const addQuestion = useCallback((type: Question['type']) => {
    setQuestions((qs) => {
      const next = [...qs, createQuestion(type)]
      setExpandedIndex(next.length - 1)
      return next
    })
  }, [])

  const removeQuestion = useCallback((id: string) => {
    setQuestions((qs) => {
      if (qs.length <= 1) { alert('Must have at least one question.'); return qs }
      const idx = qs.findIndex((q) => q.id === id)
      const next = qs.filter((q) => q.id !== id)
      setExpandedIndex((prev) => {
        if (prev === null) return null
        if (prev >= next.length) return next.length - 1
        return prev
      })
      return next
    })
  }, [])

  const updateQuestion = useCallback((updated: Question) => {
    setQuestions((qs) => qs.map((q) => (q.id === updated.id ? updated : q)))
  }, [])

  const moveUp = useCallback((index: number) => {
    setQuestions((items) => {
      if (index <= 0) return items
      const copy = [...items]
      ;[copy[index - 1], copy[index]] = [copy[index], copy[index - 1]]
      return copy
    })
    setExpandedIndex((prev) => (prev === index ? index - 1 : prev === index - 1 ? index : prev))
  }, [])

  const moveDown = useCallback((index: number) => {
    setQuestions((items) => {
      if (index >= items.length - 1) return items
      const copy = [...items]
      ;[copy[index], copy[index + 1]] = [copy[index + 1], copy[index]]
      return copy
    })
    setExpandedIndex((prev) => (prev === index ? index + 1 : prev === index + 1 ? index : prev))
  }, [])

  const toggleCell = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index))
  }, [])

  // Splitter drag
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const onSplitterMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = ((ev.clientX - rect.left) / rect.width) * 100
      setLeftPct(Math.min(50, Math.max(18, pct)))
    }

    const onUp = () => {
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  if (!activeTemplate) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p>No template selected.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to templates</button>
      </div>
    )
  }

  return (
    <div className="editor-layout">
      {/* ── Top bar ── */}
      <div className="editor-topbar no-print">
        <button
          type="button"
          className="editor-back-btn"
          onClick={() => navigate('/')}
        >
          ← Templates
        </button>

        <div className="editor-topbar-divider" />

        <input
          className="editor-docname"
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          title="Document name"
        />

        <span className="editor-template-badge">{activeTemplate.name}</span>
        {activeTemplate.orientation === 'landscape' && (
          <span className="editor-orient-badge">landscape</span>
        )}

        <div className="editor-topbar-spacer" />

        <PDFPreview template={activeTemplate} metadata={metadata} questions={questions} />
      </div>

      {/* ── Split body ── */}
      <div className="editor-body" ref={containerRef}>
        {/* Left panel */}
        <div
          className="editor-left"
          style={{ width: `${leftPct}%` }}
        >
          <MetaPanel metadata={metadata} onChange={setMetadata} />

          <div className="nb-questions-header">
            <span>Questions</span>
            <span className="nb-count">{questions.length}</span>
          </div>

          <div className="nb-cells">
            {questions.map((q, i) => (
              <NotebookCell
                key={q.id}
                question={q}
                index={i}
                total={questions.length}
                expanded={expandedIndex === i}
                onToggle={() => toggleCell(i)}
                onChange={updateQuestion}
                onRemove={removeQuestion}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
              />
            ))}
          </div>

          <div className="nb-add-buttons">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className="nb-add-btn"
                onClick={() => addQuestion(type)}
              >
                + {type}
              </button>
            ))}
          </div>
        </div>

        {/* Splitter */}
        <div className="editor-splitter" onMouseDown={onSplitterMouseDown}>
          <div className="splitter-grip">
            <span /><span /><span /><span />
          </div>
        </div>

        {/* Right panel */}
        <div className="editor-right">
          <div className="editor-preview-wrap">
            <DocumentPreview
              template={activeTemplate}
              metadata={metadata}
              questions={questions}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
