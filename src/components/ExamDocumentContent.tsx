import React from 'react'
import { formatExamTitle, formatSetLabel, mcqOptionLabel } from '../lib/documentFormat'
import type { PaperMetadata, Question } from '../types/paper'

export function ExamDocumentHeader({ metadata }: { metadata: Partial<PaperMetadata> }) {
  const setLabel = formatSetLabel(metadata)

  return (
    <>
      <div className="doc-header-box">
        <div className="doc-header-top">
          <div className="doc-logo">
            <img src="/school-logo.png" alt="School Logo" height="100%" width="100%" />
          </div>
          <div className="doc-titles">
            <div className="school-name">{metadata.schoolName || 'SOS Hermann Gmeiner School Sanothimi'}</div>
            <div className="exam-title">{formatExamTitle(metadata)}</div>
            <div className="subject-line">Subject: {metadata.subject || 'Mathematics'}</div>
          </div>
          <div className="doc-header-spacer" />
        </div>
        <div className="doc-header-bottom">
          <div className="doc-meta-left">
            <div>Class: {metadata.grade || '—'}</div>
            <div>Time: {metadata.duration || '—'}</div>
          </div>
          <div className="doc-set">{setLabel || ''}</div>
          <div className="doc-meta-right">
            <div>F.M. = {metadata.fullMarks || '—'}</div>
          </div>
        </div>
      </div>
      <div className="doc-instructions">Attempt all the questions.</div>
    </>
  )
}

function marksLabel(q: Question): string {
  return q.marks_expression ? `[${q.marks_expression}]` : q.marks ? `[${q.marks}]` : ''
}

export function ExamQuestionsBody({ questions }: { questions: Question[] }) {
  if (!questions.length) {
    return <p className="muted">No questions yet — add questions on the left.</p>
  }

  return (
    <div className="questions-list">
      {questions.map((q, idx) => (
        <div key={q.id || idx} className="doc-question-block">
          <div className="question-item">
            <div className="q-text">
              <strong>{idx + 1}. {q.question_text || '…'}</strong>
              {marksLabel(q) ? <span className="q-marks"> {marksLabel(q)}</span> : null}
            </div>
          </div>

          {q.sub_questions && q.sub_questions.length > 0 && (
            <ul className={`sub-questions-list${q.sub_questions_layout === '2col' ? ' sub-questions-2col' : ''}`}>
              {q.sub_questions.map((sq, si) => (
                <li key={sq.id || si} className="sub-question-item">
                  <span className="sub-question-label">({String.fromCharCode(97 + si)})</span>
                  <span>{sq.text || '………………'}</span>
                </li>
              ))}
            </ul>
          )}

          {q.type === 'MCQ' && q.options && q.options.length > 0 && (
            <ul className="mcq-options-list">
              {q.options.map((opt, oi) =>
                opt.trim() || q.options!.length <= 4 ? (
                  <li key={oi} className="mcq-option-item">
                    <span className="mcq-option-label">({mcqOptionLabel(oi)})</span>
                    <span>{opt || '………………'}</span>
                  </li>
                ) : null
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
