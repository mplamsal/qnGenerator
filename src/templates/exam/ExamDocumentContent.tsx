import React from 'react'
import { formatExamTitle, formatSetLabel, mcqOptionLabel } from '../../lib/documentFormat'
import MathText from '../../lib/math'
import type { PaperMetadata, Question } from '../../types/paper'

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
              <strong>{idx + 1}.</strong>{' '}
              {q.question_text ? <MathText text={q.question_text} /> : '…'}
              {q.marks ? <span className="q-marks"> [{q.marks}]</span> : null}
            </div>
          </div>
          {q.type === 'MCQ' && q.options && q.options.length > 0 && (
            <ul className="mcq-options-list">
              {q.options.map((opt, oi) =>
                opt.trim() || q.options!.length <= 4 ? (
                  <li key={oi} className="mcq-option-item">
                    <span className="mcq-option-label">({mcqOptionLabel(oi)})</span>
                    <span>{opt ? <MathText text={opt} /> : '………………'}</span>
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
