import type { PaperMetadata, Question } from '../types/paper'
import type { ComponentType } from 'react'

export type TemplateDataProps = {
  metadata?: Partial<PaperMetadata>
  questions?: Question[]
}

export type TemplateMargins = {
  top: number
  right: number
  bottom: number
  left: number
}

export type TemplateHeaderConfig = {
  enabled: boolean
  showSchoolName: boolean
  showExamTitle: boolean
  showSubjectLine: boolean
  showMetaRow: boolean
}

export type TemplateQuestionStyle = {
  showMarks: boolean
  numberingStyle: 'number' | 'letter'
  spacing: number
}

export type TemplateConfig = {
  margins: TemplateMargins
  header: TemplateHeaderConfig
  instructions: string
  footerText: string
  questionStyle: TemplateQuestionStyle
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
