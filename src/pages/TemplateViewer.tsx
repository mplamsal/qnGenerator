import React, { useMemo, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DocumentPreview from '../components/DocumentPreview'
import QuestionEditor from '../components/QuestionEditor'
import type { PaperMetadata, Question } from '../types/paper'
import { createQuestion, DEFAULT_METADATA } from '../types/paper'
import type { TemplateDefinition } from '../templates/types'
import { builtInTemplateDefinitions } from '../templates/templateReader'

export default function TemplateViewer() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(builtInTemplateDefinitions[0]?.id ?? '')
  const [viewMode, setViewMode] = useState<'gallery' | 'editor'>('gallery')
  const [docName, setDocName] = useState<string>('Untitled document')
  const [metadata, setMetadata] = useState<PaperMetadata>({ ...DEFAULT_METADATA })
  const [questions, setQuestions] = useState<Question[]>([createQuestion('MCQ')])

  const activeTemplate = useMemo<TemplateDefinition | undefined>(() => {
    return builtInTemplateDefinitions.find((template) => template.id === selectedTemplateId)
  }, [selectedTemplateId])

  const location = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tid = params.get('templateId')
    if (tid) {
      setSelectedTemplateId(tid)
      const tpl = builtInTemplateDefinitions.find((t) => t.id === tid)
      if (tpl) setDocName(tpl.name || 'Untitled document')
      setViewMode('editor')
    }
  }, [location.search])

  const categories = useMemo(() => {
    const groups: Record<string, TemplateDefinition[]> = {}
    builtInTemplateDefinitions.forEach((template) => {
      const category = template.category || 'Other'
      if (!groups[category]) groups[category] = []
      groups[category].push(template)
    })
    return groups
  }, [])

  const addQuestion = (type: Question['type'] = 'MCQ') => {
    setQuestions((qs) => [...qs, createQuestion(type)])
  }

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return alert('Must have at least one question.')
    setQuestions((qs) => qs.filter((q) => q.id !== id))
  }

  const updateQuestion = (updated: Question) => {
    setQuestions((qs) => qs.map((q) => (q.id === updated.id ? updated : q)))
  }

  const moveUp = (index: number) => {
    if (index <= 0) return
    setQuestions((items) => {
      const copy = [...items]
      ;[copy[index - 1], copy[index]] = [copy[index], copy[index - 1]]
      return copy
    })
  }

  const moveDown = (index: number) => {
    setQuestions((items) => {
      if (index >= items.length - 1) return items
      const copy = [...items]
      ;[copy[index], copy[index + 1]] = [copy[index + 1], copy[index]]
      return copy
    })
  }

  const handleReset = () => {
    setQuestions([createQuestion('MCQ')])
    setMetadata({ ...DEFAULT_METADATA })
    setSelectedTemplateId(builtInTemplateDefinitions[0]?.id ?? '')
    setViewMode('gallery')
    setDocName('Untitled document')
  }

  return (
    <div className="page-layout">
      <div className="page-header">
        <div>
          <h1>Template Viewer</h1>
          <p className="text-muted">Browse built-in page templates and edit questions for the selected layout.</p>
        </div>
      </div>

      {viewMode === 'gallery' ? (
        <div className="template-library">
          {Object.entries(categories).map(([category, templates]) => (
            <section key={category} className="template-group">
              <div className="group-title">{category}</div>
              <div className="template-grid">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className={`template-card${template.id === selectedTemplateId ? ' template-card-selected' : ''}`}
                    onClick={() => {
                      setSelectedTemplateId(template.id)
                      setDocName(template.name || 'Untitled document')
                      setViewMode('editor')
                    }}
                  >
                    <div className="template-card-header">
                      <strong>{template.name}</strong>
                      <span className="template-tag">{template.orientation || 'portrait'}</span>
                    </div>
                    <p>{template.description}</p>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      <div className="split-panel">
        {viewMode === 'editor' ? (
          <div className="topbar card no-print" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px' }}>
            <button className="btn btn-ghost" onClick={() => setViewMode('gallery')}>&larr; Templates</button>
            <input value={docName} onChange={(e) => setDocName(e.target.value)} style={{ fontSize: 18, fontWeight: 700, border: 'none', background: 'transparent' }} />
            <div style={{ marginLeft: 'auto' }} />
          </div>
        ) : null}

        <div className="panel-left">
          <div className="card">
            <div className="card-title">📋 Question Editor</div>
            <div className="meta-grid">
              <div className="input-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={metadata.subject}
                  onChange={(e) => setMetadata((m) => ({ ...m, subject: e.target.value }))}
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div className="input-group">
                <label>Grade / Class</label>
                <input
                  type="text"
                  value={metadata.grade}
                  onChange={(e) => setMetadata((m) => ({ ...m, grade: e.target.value }))}
                  placeholder="e.g. Grade 10"
                />
              </div>
              <div className="input-group">
                <label>Exam Type</label>
                <input
                  type="text"
                  value={metadata.examType}
                  onChange={(e) => setMetadata((m) => ({ ...m, examType: e.target.value }))}
                  placeholder="e.g. Final"
                />
              </div>
              <div className="input-group">
                <label>Duration</label>
                <input
                  type="text"
                  value={metadata.duration}
                  onChange={(e) => setMetadata((m) => ({ ...m, duration: e.target.value }))}
                  placeholder="e.g. 3 hours"
                />
              </div>
              <div className="input-group">
                <label>Full Marks</label>
                <input
                  type="text"
                  value={metadata.fullMarks}
                  onChange={(e) => setMetadata((m) => ({ ...m, fullMarks: e.target.value }))}
                  placeholder="e.g. 100"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">📝 Questions</div>
            <div className="question-list">
              {questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  item={question}
                  index={index}
                  canMoveDown={index < questions.length - 1}
                  onChange={updateQuestion}
                  onRemove={removeQuestion}
                  onMoveUp={moveUp}
                  onMoveDown={moveDown}
                />
              ))}
            </div>
            <div className="add-question-area">
              <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => addQuestion('MCQ')}>
                + MCQ
              </button>
              <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => addQuestion('Very Short')}>
                + Very Short
              </button>
              <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => addQuestion('Short')}>
                + Short
              </button>
              <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => addQuestion('Long')}>
                + Long
              </button>
            </div>
          </div>

          <div className="card no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="button" onClick={handleReset}>
              ↺ Reset template session
            </button>
          </div>
        </div>

        <div className="panel-right">
          <div className="card">
            <div className="card-title">📄 Preview</div>
            {activeTemplate ? (
              <DocumentPreview template={activeTemplate} metadata={metadata} questions={questions} />
            ) : (
              <p className="muted">Select a template to preview the question layout.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

