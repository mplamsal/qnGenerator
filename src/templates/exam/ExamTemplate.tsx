import React from 'react'
import { ExamDocumentHeader, ExamQuestionsBody } from './ExamDocumentContent'
import { ExamPdfDocument } from './ExamPdfDocument'
import type { TemplateDefinition, TemplateDataProps } from '../types'

export const ExamTemplate: TemplateDefinition = {
  id: 'exam',
  name: 'Exam Template',
  description: 'Standard exam layout with header, metadata, and question list.',
  PreviewComponent: function ExamPreview({ metadata, questions }: TemplateDataProps) {
    return (
      <div className="doc-body">
        <ExamDocumentHeader metadata={metadata ?? {}} />
        <ExamQuestionsBody questions={questions ?? []} />
      </div>
    )
  },
  PdfDocument: ExamPdfDocument,
}
