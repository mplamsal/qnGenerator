import type { CSSProperties } from 'react'
import MathText from '../../lib/math'
import { formatExamTitle, formatSetLabel, mcqOptionLabel } from '../../lib/documentFormat'
import type { TemplateConfig, TemplateDataProps } from '../types'
import { p } from './renderUtils'

export function TemplatePreviewRenderer({
  metadata = {},
  questions = [],
  config,
  orientation = 'portrait',
}: TemplateDataProps & { config: TemplateConfig; orientation?: 'portrait' | 'landscape' }) {
  const pageWidth = orientation === 'landscape' ? 1123 : 794
  const pageMinHeight = orientation === 'landscape' ? 794 : 1123
  const { header, headerStyle, fontSizes, questionStyle, questionLayout } = config

  const logoSize = p(40)

  const headerBorder: CSSProperties =
    headerStyle.borderStyle === 'box'
      ? { border: '1px solid #000' }
      : headerStyle.borderStyle === 'bottom-line'
      ? { borderBottom: '1px solid #000' }
      : {}

  const headerBoxStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: `${p(5)}px`,
    marginBottom: `${p(10)}px`,
    padding:
      headerStyle.paddingVertical > 0 || headerStyle.paddingHorizontal > 0
        ? `${p(headerStyle.paddingVertical)}px ${p(headerStyle.paddingHorizontal)}px`
        : undefined,
    ...headerBorder,
  }

  return (
    <div
      className="doc-page"
      style={{
        width: pageWidth,
        minHeight: pageMinHeight,
        paddingTop: p(config.margins.top),
        paddingRight: p(config.margins.right),
        paddingBottom: p(config.margins.bottom),
        paddingLeft: p(config.margins.left),
      }}
    >
      {header.enabled ? (
        <div style={headerBoxStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: logoSize, height: logoSize, flexShrink: 0 }}>
              {headerStyle.showLogo && (
                <img
                  src="/school-logo.png"
                  alt="School logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              {header.showSchoolName ? (
                <div style={{ fontWeight: 700, fontSize: `${p(fontSizes.schoolName)}px` }}>
                  {metadata.schoolName || 'Your School Name'}
                </div>
              ) : null}
              {header.showExamTitle ? (
                <div style={{ fontWeight: 700, fontSize: `${p(fontSizes.examTitle)}px`, marginTop: 2 }}>
                  {formatExamTitle(metadata)}
                </div>
              ) : null}
              {header.showSubjectLine ? (
                <div style={{ fontWeight: 700, fontSize: `${p(fontSizes.subjectLine)}px`, marginTop: 2 }}>
                  Subject: {metadata.subject || 'Subject'}
                </div>
              ) : null}
            </div>
            <div style={{ width: logoSize, flexShrink: 0 }} />
          </div>

          {header.showMetaRow ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                fontSize: `${p(fontSizes.metaRow)}px`,
              }}
            >
              <div>
                <div>Class: {metadata.grade || '—'}</div>
                <div>Time: {metadata.duration || '—'}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: `${p(fontSizes.examTitle)}px` }}>
                {formatSetLabel(metadata) || ''}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>F.M. = {metadata.fullMarks || '—'}</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {questionLayout.showDateNameFields ? (
        <div
          style={{
            display: 'flex',
            gap: `${p(20)}px`,
            flexWrap: 'wrap',
            marginBottom: `${p(10)}px`,
            fontSize: `${p(fontSizes.metaRow)}px`,
          }}
        >
          <span>
            Name:{' '}
            <span
              style={{
                display: 'inline-block',
                width: `${p(130)}px`,
                borderBottom: '1px solid #000',
                verticalAlign: 'bottom',
              }}
            />
          </span>
          <span>
            Date:{' '}
            <span
              style={{
                display: 'inline-block',
                width: `${p(80)}px`,
                borderBottom: '1px solid #000',
                verticalAlign: 'bottom',
              }}
            />
          </span>
          <span>
            Roll No.:{' '}
            <span
              style={{
                display: 'inline-block',
                width: `${p(60)}px`,
                borderBottom: '1px solid #000',
                verticalAlign: 'bottom',
              }}
            />
          </span>
        </div>
      ) : null}

      {config.instructions ? (
        <div
          style={{
            textAlign: 'center',
            fontStyle: 'italic',
            fontWeight: 700,
            marginBottom: `${p(10)}px`,
            fontSize: `${p(fontSizes.instructions)}px`,
          }}
        >
          {config.instructions}
        </div>
      ) : null}

      <div
        style={
          questionLayout.columns === 2
            ? { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: `${p(14)}px` }
            : {}
        }
      >
        {questions.map((q, idx) => (
          <div key={q.id || idx} style={{ marginBottom: `${p(questionStyle.spacing)}px` }}>
            <div style={{ fontSize: `${p(fontSizes.questionText)}px`, lineHeight: 1.6 }}>
              <strong>
                {questionStyle.numberingStyle === 'letter'
                  ? `${String.fromCharCode(97 + idx)}.`
                  : `${idx + 1}.`}
              </strong>{' '}
              {q.question_text ? <MathText text={q.question_text} /> : '...'}
              {questionStyle.showMarks && q.marks ? (
                <span style={{ fontStyle: 'italic', color: '#374151' }}> [{q.marks}]</span>
              ) : null}
            </div>

            {q.type === 'MCQ' && q.options?.length ? (
              <div
                style={{
                  margin: `${p(3)}px 0 0 ${p(14)}px`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${questionLayout.mcqColumns}, 1fr)`,
                  gap: `${p(2)}px ${p(10)}px`,
                  fontSize: `${p(fontSizes.mcqOption)}px`,
                }}
              >
                {q.options.map((opt, oi) =>
                  opt.trim() || q.options!.length <= 4 ? (
                    <div key={oi} style={{ display: 'flex', gap: `${p(4)}px`, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 600, flexShrink: 0 }}>({mcqOptionLabel(oi)})</span>
                      <span>{opt ? <MathText text={opt} /> : '………………'}</span>
                    </div>
                  ) : null
                )}
              </div>
            ) : null}

            {questionLayout.showAnswerLines && questionLayout.answerLineCount > 0 ? (
              <div style={{ marginTop: `${p(5)}px`, marginLeft: `${p(14)}px` }}>
                {Array.from({ length: questionLayout.answerLineCount }).map((_, li) => (
                  <div
                    key={li}
                    style={{
                      borderBottom: '0.75px solid #aaa',
                      height: `${p(14)}px`,
                      marginBottom: `${p(3)}px`,
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {config.footerText ? (
        <div
          style={{
            marginTop: `${p(16)}px`,
            fontSize: `${p(fontSizes.footer)}px`,
            textAlign: 'center',
            fontStyle: 'italic',
            color: '#555',
          }}
        >
          {config.footerText}
        </div>
      ) : null}
    </div>
  )
}
