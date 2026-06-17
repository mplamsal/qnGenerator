import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import MathText from '../lib/math'
import { formatExamTitle, formatSetLabel, mcqOptionLabel } from '../lib/documentFormat'
import type { PaperMetadata, Question } from '../types/paper'
import type { TemplateDataProps } from './types'
import type { TemplateConfig } from './types'

export type SavedTemplate = {
  id: string
  name: string
  description?: string
  category?: string
  orientation?: 'portrait' | 'landscape'
  config: TemplateConfig
  createdAt?: string
}

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  margins: {
    top: 32,
    right: 40,
    bottom: 32,
    left: 40,
  },
  header: {
    enabled: true,
    showSchoolName: true,
    showExamTitle: true,
    showSubjectLine: true,
    showMetaRow: true,
  },
  instructions: 'Attempt all the questions.',
  footerText: 'Good luck! Read each question carefully.',
  questionStyle: {
    showMarks: true,
    numberingStyle: 'number',
    spacing: 12,
  },
}

export function createSavedTemplateDefinition(template: SavedTemplate) {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    orientation: template.orientation,
    config: template.config,
    PreviewComponent: (props: TemplateDataProps) => (
      <SavedTemplatePreview {...props} config={template.config} />
    ),
    PdfDocument: (props: TemplateDataProps) => (
      <SavedTemplatePdfDocument {...props} config={template.config} />
    ),
  }
}

function headerText(metadata: Partial<PaperMetadata>, config: TemplateConfig) {
  const parts: React.ReactNode[] = []
  if (config.header.showSchoolName) {
    parts.push(
      <div key="school" className="school-name">
        {metadata.schoolName || 'SOS Hermann Gmeiner School, Sanothimi Bhaktapur'}
      </div>
    )
  }

  if (config.header.showExamTitle) {
    parts.push(
      <div key="exam-title" className="exam-title">
        {formatExamTitle(metadata)}
      </div>
    )
  }

  if (config.header.showSubjectLine) {
    parts.push(
      <div key="subject-line" className="subject-line">
        Subject: {metadata.subject || 'Mathematics'}
      </div>
    )
  }

  return parts
}

function SavedTemplatePreview({ metadata = {}, questions = [], config }: TemplateDataProps & { config: TemplateConfig }) {
  return (
    <div
      className="doc-page"
      style={{
        paddingTop: config.margins.top,
        paddingRight: config.margins.right,
        paddingBottom: config.margins.bottom,
        paddingLeft: config.margins.left,
      }}
    >
      {config.header.enabled ? (
        <div className="doc-header-box">
          <div className="doc-header-top">
            <div className="doc-logo">
              <img src="/school-logo.png" alt="School logo" />
            </div>
            <div className="doc-titles">{headerText(metadata, config)}</div>
            <div className="doc-header-spacer" />
          </div>
          {config.header.showMetaRow ? (
            <div className="doc-header-bottom">
              <div className="doc-meta-left">
                <div>Class: {metadata.grade || '—'}</div>
                <div>Time: {metadata.duration || '—'}</div>
              </div>
              <div className="doc-set">{formatSetLabel(metadata) || ''}</div>
              <div className="doc-meta-right">
                <div>F.M. = {metadata.fullMarks || '—'}</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {config.instructions ? <div className="doc-instructions">{config.instructions}</div> : null}

      <div className="questions-list">
        {questions.map((q, idx) => (
          <div
            key={q.id || idx}
            className="doc-question-block"
            style={{ marginBottom: config.questionStyle.spacing }}
          >
            <div className="question-item">
              <div className="q-text">
                <strong>{config.questionStyle.numberingStyle === 'letter' ? `${String.fromCharCode(97 + idx)}.` : `${idx + 1}.`}</strong>{' '}
                {q.question_text ? <MathText text={q.question_text} /> : '…'}
                {config.questionStyle.showMarks && q.marks ? <span className="q-marks"> [{q.marks}]</span> : null}
              </div>
            </div>
            {q.type === 'MCQ' && q.options && q.options.length > 0 ? (
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
            ) : null}
          </div>
        ))}
      </div>

      {config.footerText ? <div className="saved-template-footer">{config.footerText}</div> : null}
    </div>
  )
}

function SavedTemplatePdfDocument({ metadata = {}, questions = [], config }: TemplateDataProps & { config: TemplateConfig }) {
  const pageStyle = {
    paddingTop: config.margins.top,
    paddingRight: config.margins.right,
    paddingBottom: config.margins.bottom,
    paddingLeft: config.margins.left,
    fontSize: 12,
    fontFamily: 'Times-Roman',
  }

  const questionSpacing = config.questionStyle.spacing

  return (
    <Document>
      <Page size="A4" style={pageStyle}>
        {config.header.enabled ? (
          <View style={styles.headerBox}>
            <View style={styles.headerTop}>
              <View style={styles.logoBox}>
                <Image src="/school-logo.png" style={{ width: 48, height: 48 }} />
              </View>
              <View style={styles.titles}>
                {config.header.showSchoolName ? (
                  <Text style={styles.schoolName}>{metadata.schoolName || 'SOS Hermann Gmeiner School Sanothimi'}</Text>
                ) : null}
                {config.header.showExamTitle ? (
                  <Text style={styles.examTitle}>{formatExamTitle(metadata)}</Text>
                ) : null}
                {config.header.showSubjectLine ? (
                  <Text style={styles.subjectLine}>Subject: {metadata.subject || 'Mathematics'}</Text>
                ) : null}
              </View>
            </View>
            {config.header.showMetaRow ? (
              <View style={styles.headerBottom}>
                <View style={styles.metaLeft}>
                  <Text>Class: {metadata.grade || '—'}</Text>
                  <Text>Time: {metadata.duration || '—'}</Text>
                </View>
                <Text style={styles.setLine}>{formatSetLabel(metadata) || ''}</Text>
                <View style={styles.metaRight}>
                  <Text>F.M. = {metadata.fullMarks || '—'}</Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {config.instructions ? <Text style={styles.instructions}>{config.instructions}</Text> : null}

        <View>
          {questions.map((q, idx) => (
            <View key={q.id || idx} style={[styles.questionBlock, { marginBottom: questionSpacing }]}> 
              <View style={styles.questionLine}>
                <Text style={styles.questionText}>
                  {config.questionStyle.numberingStyle === 'letter'
                    ? `${String.fromCharCode(97 + idx)}.`
                    : `${idx + 1}.`} {q.question_text || '…'}
                </Text>
                {config.questionStyle.showMarks && q.marks ? <Text style={styles.questionMarks}>[{q.marks}]</Text> : null}
              </View>
              {q.type === 'MCQ' && q.options && q.options.length > 0 ? (
                <View style={styles.mcqList}>
                  {q.options.map((opt, oi) =>
                    opt.trim() || q.options!.length <= 4 ? (
                      <View key={oi} style={styles.mcqOption}>
                        <Text style={styles.mcqBullet}>({mcqOptionLabel(oi)})</Text>
                        <Text style={styles.mcqText}>{opt || '………………'}</Text>
                      </View>
                    ) : null
                  )}
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {config.footerText ? <Text style={styles.savedFooter}>{config.footerText}</Text> : null}
      </Page>
    </Document>
  )
}

const styles = StyleSheet.create({
  headerBox: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoBox: { width: 48, height: 48 },
  titles: { alignItems: 'center', flex: 1 },
  schoolName: { fontSize: 14, fontWeight: 700 },
  examTitle: { fontSize: 12, fontWeight: 700, marginTop: 2 },
  subjectLine: { fontSize: 12, fontWeight: 700, marginTop: 2 },
  headerBottom: { flexDirection: 'row', marginTop: 6 },
  metaLeft: { width: '33%', fontSize: 11 },
  setLine: { width: '34%', fontSize: 12, fontWeight: 700, textAlign: 'center' },
  metaRight: { width: '33%', fontSize: 11, textAlign: 'right' },
  instructions: { fontStyle: 'italic', textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
  questionBlock: { marginBottom: 8 },
  questionLine: { flexDirection: 'row', marginBottom: 2 },
  questionText: { flex: 1 },
  questionMarks: { marginLeft: 4, fontStyle: 'italic' },
  mcqList: { marginLeft: 18, marginTop: 2 },
  mcqOption: { flexDirection: 'row', marginBottom: 1 },
  mcqBullet: { width: 18 },
  mcqText: { flex: 1 },
  savedFooter: { marginTop: 16, fontSize: 10, textAlign: 'center', color: '#555' },
})
