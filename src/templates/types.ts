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

export type TemplateConfig = {
  margins: TemplateMargins
  header: TemplateHeaderConfig
  headerStyle: TemplateHeaderStyle
  fontSizes: TemplateFontSizes
  instructions: string
  footerText: string
  questionStyle: TemplateQuestionStyle
  questionLayout: TemplateQuestionLayout
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
