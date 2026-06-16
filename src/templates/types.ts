import type { PaperMetadata, Question } from '../types/paper'
import type { ComponentType } from 'react'

export type TemplateDataProps = {
  metadata?: Partial<PaperMetadata>
  questions?: Question[]
}

export type TemplateDefinition = {
  id: string
  name: string
  description?: string
  PreviewComponent: ComponentType<TemplateDataProps>
  PdfDocument: ComponentType<TemplateDataProps>
}
