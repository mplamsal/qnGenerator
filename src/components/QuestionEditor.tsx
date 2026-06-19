import React, { useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import MathSymbolBar, { insertAtCursor } from './MathSymbolBar'
import { DEFAULT_MCQ_OPTIONS, ensureMcqOptions, type Question, type QuestionType, type SubQuestion } from '../types/paper'
import { mcqOptionLabel } from '../lib/documentFormat'

type Props = {
  item: Question
  index: number
  canMoveDown: boolean
  onChange: (q: Question) => void
  onRemove: (id: string) => void
  onMoveUp: (i: number) => void
  onMoveDown: (i: number) => void
}

export default function QuestionEditor({ item, index, canMoveDown, onChange, onRemove, onMoveUp, onMoveDown }: Props) {
  const questionRef = useRef<HTMLTextAreaElement>(null)
  const optionRefs = useRef<(HTMLInputElement | null)[]>([])
  const subQRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleTypeChange = (type: QuestionType) => {
    const next: Question = { ...item, type, marks: item.marks }
    if (type === 'MCQ') {
      onChange(ensureMcqOptions({ ...next, type: 'MCQ' }))
    } else {
      const { options, ...rest } = next
      onChange(rest)
    }
  }

  const updateOption = (oi: number, value: string) => {
    const options = [...(item.options || DEFAULT_MCQ_OPTIONS)]
    options[oi] = value
    onChange({ ...item, options })
  }

  const addOption = () => {
    if ((item.options?.length || 0) >= 6) return
    onChange({ ...item, options: [...(item.options || DEFAULT_MCQ_OPTIONS), ''] })
  }

  const removeOption = (oi: number) => {
    if (!item.options || item.options.length <= 4) return
    onChange({ ...item, options: item.options.filter((_, i) => i !== oi) })
  }

  const addSubQuestion = () => {
    const sq: SubQuestion = { id: uuidv4(), text: '' }
    onChange({ ...item, sub_questions: [...(item.sub_questions || []), sq] })
  }

  const updateSubQuestion = (si: number, text: string) => {
    const sqs = [...(item.sub_questions || [])]
    sqs[si] = { ...sqs[si], text }
    onChange({ ...item, sub_questions: sqs })
  }

  const removeSubQuestion = (si: number) => {
    const sqs = (item.sub_questions || []).filter((_, i) => i !== si)
    onChange({ ...item, sub_questions: sqs.length ? sqs : undefined })
  }

  const subQLabel = (i: number) => String.fromCharCode(97 + i)

  return (
    <div className="question-item-editor">
      <div className="q-header">
        <span className="q-number">Q{index + 1}</span>
        <span className="q-type-pill">{item.type}</span>
        <div className="q-actions">
          <button type="button" onClick={() => onMoveUp(index)} disabled={index === 0} title="Move up">↑</button>
          <button type="button" onClick={() => onMoveDown(index)} disabled={!canMoveDown} title="Move down">↓</button>
          <button type="button" className="remove-btn" onClick={() => onRemove(item.id)} title="Remove">✕</button>
        </div>
      </div>

      <div className="q-body">
        <div className="q-row">
          <div className="q-field">
            <label className="field-label">Type</label>
            <select
              className="field-control"
              value={item.type}
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            >
              <option value="MCQ">MCQ</option>
              <option value="Very Short">Very Short</option>
              <option value="Short">Short</option>
              <option value="Long">Long</option>
            </select>
          </div>
          <div className="q-field q-field-narrow">
            <label className="field-label">Marks</label>
            <input
              className="field-control"
              type="number"
              min={1}
              value={item.marks}
              onChange={(e) => onChange({ ...item, marks: Number(e.target.value) || 1 })}
            />
          </div>
          <div className="q-field q-field-narrow">
            <label className="field-label" title="Display as e.g. 1+2+3 instead of 6">Marks label</label>
            <input
              className="field-control"
              type="text"
              value={item.marks_expression || ''}
              onChange={(e) => onChange({ ...item, marks_expression: e.target.value || undefined })}
              placeholder={String(item.marks)}
            />
          </div>
        </div>

        <div className="field-block">
          <label className="field-label">Question</label>
          <MathSymbolBar
            targetRef={questionRef}
            onInsert={(sym, el) =>
              insertAtCursor(el, sym, (value) => onChange({ ...item, question_text: value }))
            }
          />
          <textarea
            ref={questionRef}
            className="field-control field-textarea"
            value={item.question_text}
            onChange={(e) => onChange({ ...item, question_text: e.target.value })}
            placeholder="Enter question text. Use math symbols above for equations."
            rows={3}
          />
        </div>

        {/* Sub-questions */}
        {(item.sub_questions && item.sub_questions.length > 0) ? (
          <div className="sub-questions-editor">
            <div className="sub-questions-header">
              <label className="field-label">Sub-questions</label>
              <div className="sub-questions-layout-toggle">
                <button
                  type="button"
                  className={`btn btn-sm btn-ghost${item.sub_questions_layout !== '2col' ? ' active' : ''}`}
                  onClick={() => onChange({ ...item, sub_questions_layout: 'vertical' })}
                  title="Stack vertically"
                >
                  ☰ Vertical
                </button>
                <button
                  type="button"
                  className={`btn btn-sm btn-ghost${item.sub_questions_layout === '2col' ? ' active' : ''}`}
                  onClick={() => onChange({ ...item, sub_questions_layout: '2col' })}
                  title="2 columns"
                >
                  ⊞ 2 Columns
                </button>
              </div>
            </div>
            {item.sub_questions.map((sq, si) => (
              <div key={sq.id} className="sub-question-row">
                <span className="sub-question-label">({subQLabel(si)})</span>
                <input
                  ref={(el) => { subQRefs.current[si] = el }}
                  className="field-control"
                  value={sq.text}
                  onChange={(e) => updateSubQuestion(si, e.target.value)}
                  placeholder={`Sub-question ${subQLabel(si)}`}
                />
                <MathSymbolBar
                  targetRef={{ current: subQRefs.current[si] }}
                  onInsert={(sym, el) =>
                    insertAtCursor(el, sym, (value) => updateSubQuestion(si, value))
                  }
                />
                <button type="button" className="mcq-option-remove" onClick={() => removeSubQuestion(si)}>✕</button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm mcq-add-option" onClick={addSubQuestion}>
              + Add sub-question
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm sub-q-add-first" onClick={addSubQuestion}>
            + Add sub-questions (a, b, c…)
          </button>
        )}

        {item.type === 'MCQ' && (
          <div className="mcq-options-editor">
            <label className="field-label">Options</label>
            {(item.options || DEFAULT_MCQ_OPTIONS).map((opt, oi) => (
              <div key={oi} className="mcq-option-row">
                <span className="mcq-option-bullet">({mcqOptionLabel(oi)})</span>
                <input
                  ref={(el) => { optionRefs.current[oi] = el }}
                  className="field-control"
                  value={opt}
                  onChange={(e) => updateOption(oi, e.target.value)}
                  placeholder={`Option ${mcqOptionLabel(oi)}`}
                />
                <MathSymbolBar
                  targetRef={{ current: optionRefs.current[oi] }}
                  onInsert={(sym, el) =>
                    insertAtCursor(el, sym, (value) => updateOption(oi, value))
                  }
                />
                {(item.options?.length || 0) > 4 && (
                  <button type="button" className="mcq-option-remove" onClick={() => removeOption(oi)}>✕</button>
                )}
              </div>
            ))}
            {(item.options?.length || 4) < 6 && (
              <button type="button" className="btn btn-ghost btn-sm mcq-add-option" onClick={addOption}>
                + Add option
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
