import type { CSSProperties } from 'react'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import MathText from '../lib/math'
import { formatExamTitle, formatSetLabel, mcqOptionLabel } from '../lib/documentFormat'
import type { TemplateConfig, TemplateDataProps, TemplateLayout } from './types'
import type { PaperMetadata, Question } from '../types/paper'

// All config values are in PDF points (pt).
// Preview multiplies by PT_TO_PX so both outputs are proportionally identical.
const PT_TO_PX = 794 / 595.28  // ≈ 1.3338

function p(pt: number): number {
  return pt * PT_TO_PX
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const DEFAULT_LAYOUT: TemplateLayout = {
  twinColumns: false,
  lineHeight: 1.5,
  headerSpacing: 5,
  sectionSpacing: 10,
}

// Older saved/built-in configs may not include the `layout` block — fill defaults.
export function resolveLayout(config: TemplateConfig): TemplateLayout {
  return { ...DEFAULT_LAYOUT, ...(config.layout ?? {}) }
}

// ── Preview renderer (HTML) ──────────────────────────────────────────────────

function PreviewBody({
  metadata,
  questions,
  config,
}: {
  metadata: Partial<PaperMetadata>
  questions: Question[]
  config: TemplateConfig
}) {
  const { header, headerStyle, fontSizes, questionStyle, questionLayout } = config
  const layout = resolveLayout(config)
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
    gap: `${p(layout.headerSpacing)}px`,
    marginBottom: `${p(layout.sectionSpacing)}px`,
    padding:
      headerStyle.paddingVertical > 0 || headerStyle.paddingHorizontal > 0
        ? `${p(headerStyle.paddingVertical)}px ${p(headerStyle.paddingHorizontal)}px`
        : undefined,
    ...headerBorder,
  }

  return (
    <>
      {/* ── Header ── */}
      {header.enabled ? (
        <div style={headerBoxStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Logo placeholder always occupies space to keep titles centred */}
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

      {/* ── Name / Date fields ── */}
      {questionLayout.showDateNameFields ? (
        <div
          style={{
            display: 'flex',
            gap: `${p(20)}px`,
            flexWrap: 'wrap',
            marginBottom: `${p(layout.sectionSpacing)}px`,
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

      {/* ── Instructions ── */}
      {config.instructions ? (
        <div
          style={{
            textAlign: 'center',
            fontStyle: 'italic',
            fontWeight: 700,
            marginBottom: `${p(layout.sectionSpacing)}px`,
            fontSize: `${p(fontSizes.instructions)}px`,
          }}
        >
          {config.instructions}
        </div>
      ) : null}

      {/* ── Questions ── */}
      <div
        style={
          questionLayout.columns === 2
            ? {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                columnGap: `${p(14)}px`,
              }
            : {}
        }
      >
        {questions.map((q, idx) => (
          <div key={q.id || idx} style={{ marginBottom: `${p(questionStyle.spacing)}px` }}>
            <div style={{ fontSize: `${p(fontSizes.questionText)}px`, lineHeight: layout.lineHeight }}>
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

            {/* MCQ options */}
            {q.type === 'MCQ' && q.options?.length ? (
              <div
                style={{
                  margin: `${p(3)}px 0 0 ${p(14)}px`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${questionLayout.mcqColumns}, 1fr)`,
                  gap: `${p(2)}px ${p(10)}px`,
                  fontSize: `${p(fontSizes.mcqOption)}px`,
                  lineHeight: layout.lineHeight,
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

            {/* Answer lines */}
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

      {/* ── Footer ── */}
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
    </>
  )
}

export function TemplatePreviewRenderer({
  metadata = {},
  questions = [],
  config,
  orientation = 'portrait',
}: TemplateDataProps & { config: TemplateConfig; orientation?: 'portrait' | 'landscape' }) {
  const pageWidth = orientation === 'landscape' ? 1123 : 794
  const pageMinHeight = orientation === 'landscape' ? 794 : 1123
  const layout = resolveLayout(config)

  const pageStyle: CSSProperties = {
    width: pageWidth,
    minHeight: pageMinHeight,
    paddingTop: p(config.margins.top),
    paddingRight: p(config.margins.right),
    paddingBottom: p(config.margins.bottom),
    paddingLeft: p(config.margins.left),
  }

  if (layout.twinColumns) {
    const gap = p(14)
    return (
      <div className="doc-page" style={{ ...pageStyle, display: 'flex' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: gap }}>
          <PreviewBody metadata={metadata} questions={questions} config={config} />
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            paddingLeft: gap,
            borderLeft: '1px dashed #999',
          }}
        >
          <PreviewBody metadata={metadata} questions={questions} config={config} />
        </div>
      </div>
    )
  }

  return (
    <div className="doc-page" style={pageStyle}>
      <PreviewBody metadata={metadata} questions={questions} config={config} />
    </div>
  )
}

// ── PDF renderer (react-pdf) ──────────────────────────────────────────────────
// Uses config values directly as pt — no conversion needed.

function PdfQuestion({ q, idx, config }: { q: Question; idx: number; config: TemplateConfig }) {
  const { questionStyle, questionLayout, fontSizes } = config
  const layout = resolveLayout(config)
  const mcqCols = questionLayout.mcqColumns
  const validOptions = q.options?.filter((opt) => opt.trim() || (q.options?.length ?? 0) <= 4) ?? []

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 2 }}>
        <Text style={{ flex: 1, fontSize: fontSizes.questionText, fontFamily: 'Times-Roman', lineHeight: layout.lineHeight }}>
          {questionStyle.numberingStyle === 'letter'
            ? `${String.fromCharCode(97 + idx)}.`
            : `${idx + 1}.`}{' '}
          {q.question_text || '...'}
          {questionStyle.showMarks && q.marks ? ` [${q.marks}]` : ''}
        </Text>
      </View>

      {/* MCQ options */}
      {q.type === 'MCQ' && validOptions.length > 0 ? (
        <View style={{ marginLeft: 14, marginTop: 3 }}>
          {chunkArray(validOptions, mcqCols).map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', marginBottom: 2 }}>
              {row.map((opt, ci) => {
                const oi = ri * mcqCols + ci
                const isLast = ci === row.length - 1
                return (
                  <View
                    key={oi}
                    style={{ flex: 1, flexDirection: 'row', marginRight: isLast ? 0 : 6 }}
                  >
                    <Text style={{ width: 16, fontSize: fontSizes.mcqOption, fontFamily: 'Times-Roman' }}>
                      ({mcqOptionLabel(oi)})
                    </Text>
                    <Text style={{ flex: 1, fontSize: fontSizes.mcqOption, fontFamily: 'Times-Roman', lineHeight: layout.lineHeight }}>
                      {opt || '………………'}
                    </Text>
                  </View>
                )
              })}
            </View>
          ))}
        </View>
      ) : null}

      {/* Answer lines */}
      {questionLayout.showAnswerLines && questionLayout.answerLineCount > 0 ? (
        <View style={{ marginLeft: 14, marginTop: 5 }}>
          {Array.from({ length: questionLayout.answerLineCount }).map((_, li) => (
            <View
              key={li}
              style={{ borderBottomWidth: 0.5, borderBottomColor: '#aaa', height: 14, marginBottom: 3 }}
            />
          ))}
        </View>
      ) : null}
    </View>
  )
}

function PdfBody({
  metadata,
  questions,
  config,
}: {
  metadata: Partial<PaperMetadata>
  questions: Question[]
  config: TemplateConfig
}) {
  const { header, headerStyle, fontSizes, questionStyle, questionLayout } = config
  const layout = resolveLayout(config)
  const logoSize = 40

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headerBoxPdfStyle: any = {
    marginBottom: layout.sectionSpacing,
    ...(headerStyle.paddingVertical > 0 || headerStyle.paddingHorizontal > 0
      ? { paddingTop: headerStyle.paddingVertical, paddingBottom: headerStyle.paddingVertical, paddingLeft: headerStyle.paddingHorizontal, paddingRight: headerStyle.paddingHorizontal }
      : {}),
    ...(headerStyle.borderStyle === 'box'
      ? { borderWidth: 0.75, borderColor: '#000' }
      : headerStyle.borderStyle === 'bottom-line'
      ? { borderBottomWidth: 0.75, borderBottomColor: '#000' }
      : {}),
  }

  return (
    <View>
      {/* ── Header ── */}
      {header.enabled ? (
        <View style={headerBoxPdfStyle}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ width: logoSize, height: logoSize }}>
              {headerStyle.showLogo ? (
                <Image src="/school-logo.png" style={{ width: logoSize, height: logoSize }} />
              ) : null}
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              {header.showSchoolName ? (
                <Text style={{ fontSize: fontSizes.schoolName, fontFamily: 'Times-Bold' }}>
                  {metadata.schoolName || 'Your School Name'}
                </Text>
              ) : null}
              {header.showExamTitle ? (
                <Text style={{ fontSize: fontSizes.examTitle, fontFamily: 'Times-Bold', marginTop: 2 }}>
                  {formatExamTitle(metadata)}
                </Text>
              ) : null}
              {header.showSubjectLine ? (
                <Text style={{ fontSize: fontSizes.subjectLine, fontFamily: 'Times-Bold', marginTop: 2 }}>
                  Subject: {metadata.subject || 'Subject'}
                </Text>
              ) : null}
            </View>
            <View style={{ width: logoSize }} />
          </View>

          {header.showMetaRow ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: layout.headerSpacing,
              }}
            >
              <View>
                <Text style={{ fontSize: fontSizes.metaRow }}>Class: {metadata.grade || '—'}</Text>
                <Text style={{ fontSize: fontSizes.metaRow }}>Time: {metadata.duration || '—'}</Text>
              </View>
              <Text style={{ fontSize: fontSizes.examTitle, fontFamily: 'Times-Bold' }}>
                {formatSetLabel(metadata) || ''}
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: fontSizes.metaRow }}>F.M. = {metadata.fullMarks || '—'}</Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* ── Name / Date fields ── */}
      {questionLayout.showDateNameFields ? (
        <View style={{ flexDirection: 'row', marginBottom: layout.sectionSpacing }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginRight: 18 }}>
            <Text style={{ fontSize: fontSizes.metaRow }}>Name: </Text>
            <View style={{ width: 110, borderBottomWidth: 0.75, borderBottomColor: '#000', height: 11 }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginRight: 18 }}>
            <Text style={{ fontSize: fontSizes.metaRow }}>Date: </Text>
            <View style={{ width: 70, borderBottomWidth: 0.75, borderBottomColor: '#000', height: 11 }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: fontSizes.metaRow }}>Roll No.: </Text>
            <View style={{ width: 55, borderBottomWidth: 0.75, borderBottomColor: '#000', height: 11 }} />
          </View>
        </View>
      ) : null}

      {/* ── Instructions ── */}
      {config.instructions ? (
        <Text
          style={{
            textAlign: 'center',
            fontStyle: 'italic',
            fontFamily: 'Times-BoldItalic',
            fontSize: fontSizes.instructions,
            marginBottom: layout.sectionSpacing,
          }}
        >
          {config.instructions}
        </Text>
      ) : null}

      {/* ── Questions ── */}
      {questionLayout.columns === 2 ? (
        <View>
          {chunkArray(questions, 2).map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', marginBottom: questionStyle.spacing }}>
              {row.map((q, ci) => {
                const idx = ri * 2 + ci
                return (
                  <View key={q.id || idx} style={{ flex: 1, marginRight: ci === 0 ? 7 : 0, marginLeft: ci === 1 ? 7 : 0 }}>
                    <PdfQuestion q={q} idx={idx} config={config} />
                  </View>
                )
              })}
            </View>
          ))}
        </View>
      ) : (
        <View>
          {questions.map((q, idx) => (
            <View key={q.id || idx} style={{ marginBottom: questionStyle.spacing }}>
              <PdfQuestion q={q} idx={idx} config={config} />
            </View>
          ))}
        </View>
      )}

      {/* ── Footer ── */}
      {config.footerText ? (
        <Text
          style={{
            marginTop: 16,
            fontSize: fontSizes.footer,
            textAlign: 'center',
            fontStyle: 'italic',
            color: '#555555',
          }}
        >
          {config.footerText}
        </Text>
      ) : null}
    </View>
  )
}

export function TemplatePdfRenderer({
  metadata = {},
  questions = [],
  config,
  orientation = 'portrait',
}: TemplateDataProps & { config: TemplateConfig; orientation?: 'portrait' | 'landscape' }) {
  const { fontSizes } = config
  const layout = resolveLayout(config)

  const pageStyle = {
    paddingTop: config.margins.top,
    paddingRight: config.margins.right,
    paddingBottom: config.margins.bottom,
    paddingLeft: config.margins.left,
    fontFamily: 'Times-Roman',
    fontSize: fontSizes.questionText,
  }

  return (
    <Document>
      <Page size="A4" orientation={orientation} style={pageStyle}>
        {layout.twinColumns ? (
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <PdfBody metadata={metadata} questions={questions} config={config} />
            </View>
            <View
              style={{
                flex: 1,
                paddingLeft: 12,
                borderLeftWidth: 0.75,
                borderLeftColor: '#999999',
                borderStyle: 'dashed',
              }}
            >
              <PdfBody metadata={metadata} questions={questions} config={config} />
            </View>
          </View>
        ) : (
          <PdfBody metadata={metadata} questions={questions} config={config} />
        )}
      </Page>
    </Document>
  )
}
