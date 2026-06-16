import React from 'react'

type Question = { question_text: string, marks?: number }

export default function DocumentPreview({ metadata, questions }: { metadata:any, questions: Question[] }){
  return (
    <div className="doc-wrapper">
      <div className="doc-page">
        <div className="doc-header-box">
          <div className="doc-header-top">
            <div className="doc-logo">
              <img src="/school-logo.png" alt="School Logo" height="100%" width="100%"/>
            </div>
            <div className="doc-titles">
              <div className="school-name">{metadata?.schoolName || 'SOS Hermann Gmeiner School Sanothimi'}</div>
              <div className="exam-title">First Unit Test 2026</div> {/* Using static as in demo, or metadata.examType */}
              <div className="subject-line">Subject: {metadata?.subject || 'Mathematics'}</div>
            </div>
            <div className="doc-header-spacer"></div>
          </div>
          <div className="doc-header-bottom">
            <div className="doc-meta-left">
              <div>Class: {metadata?.grade || 'V'}</div>
              <div>Time: {metadata?.duration || '40 minutes'}</div>
            </div>
            <div className="doc-set">SET A</div>
            <div className="doc-meta-right">
              <div>F.M. = {metadata?.fullMarks || '20'}</div>
            </div>
          </div>
        </div>

        <div className="doc-instructions">Attempt all the questions.</div>

        <div className="doc-body">
          {questions && questions.length>0 ? (
            <div className="questions-list">
              {questions.map((q, idx)=> (
                <p key={idx} className="question-item">
                  <div className="q-text"><strong>{idx+1}.</strong> {q.question_text}</div>
                  {q.marks ? <div className="q-marks">[{q.marks}]</div> : null}
                </p>
              ))}
            </div>
          ) : (
            <p className="muted">No questions yet — add questions on the left.</p>
          )}
        </div>
      </div>
    </div>
  )
}
