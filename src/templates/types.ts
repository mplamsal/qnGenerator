import type { PaperMetadata, Question } from '../types/paper'
import type { ComponentType } from 'react'

export type TemplateDataProps = {
  metadata?: Partial<PaperMetadata>
  questions?: Question[]
}

export type TemplateMargins = {
  top: number     // pt
  right: number   // pt
  bottom: number  // pt
  left: number    // pt
}

export type TemplateHeaderConfig = {
  enabled: boolean
  showSchoolName: boolean
  showExamTitle: boolean
  showSubjectLine: boolean
  showMetaRow: boolean
}

export type TemplateHeaderStyle = {
  showLogo: boolean
  borderStyle: 'box' | 'bottom-line' | 'none'
  paddingVertical: number    // pt
  paddingHorizontal: number  // pt
}

export type TemplateFontSizes = {
  schoolName: number    // pt
  examTitle: number     // pt
  subjectLine: number   // pt
  metaRow: number       // pt
  instructions: number  // pt
  questionText: number  // pt
  mcqOption: number     // pt
  footer: number        // pt
}

export type TemplateQuestionStyle = {
  showMarks: boolean
  numberingStyle: 'number' | 'letter'
  spacing: number  // pt — vertical gap between questions
}

export type TemplateQuestionLayout = {
  columns: 1 | 2
  mcqColumns: 1 | 2 | 4
  showAnswerLines: boolean
  answerLineCount: number
  showDateNameFields: boolean
}

// Compactness + page layout controls.
export type TemplateLayout = {
  // Render two identical tear-off copies side by side (ideal on landscape A4 so
  // the sheet can be cut down the middle into two complete papers).
  twinColumns: boolean
  // Line-height multiplier for question / option text (lower = more compact).
  lineHeight: number
  // pt — vertical gap between header lines; drives the header box height.
  headerSpacing: number
  // pt — gap below the header and instructions blocks.
  sectionSpacing: number
}

export type TemplateConfig = {
  margins: TemplateMargins
  header: TemplateHeaderConfig
  headerStyle: TemplateHeaderStyle
  fontSizes: TemplateFontSizes
  instructions: string
  footerText: string
  questionStyle: TemplateQuestionStyle
  questionLayout: TemplateQuestionLayout
  layout: TemplateLayout
}

export type TemplateDefinition = {
  id: string
  name: string
  description?: string
  category?: string
  orientation?: 'portrait' | 'landscape'
  config?: TemplateConfig
  PreviewComponent: ComponentType<TemplateDataProps>
  PdfDocument: ComponentType<TemplateDataProps>
}
