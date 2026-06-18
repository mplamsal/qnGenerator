import { TemplatePreviewRenderer, TemplatePdfRenderer } from './TemplateRenderer'
import type { TemplateConfig, TemplateDataProps, TemplateDefinition } from './types'
import type { SavedTemplate } from '../types/savedTemplate'

export type { SavedTemplate }

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  margins: { top: 54, right: 56, bottom: 54, left: 56 },
  header: {
    enabled: true,
    showSchoolName: true,
    showExamTitle: true,
    showSubjectLine: true,
    showMetaRow: true,
  },
  headerStyle: { showLogo: true, borderStyle: 'box', paddingVertical: 8, paddingHorizontal: 12 },
  fontSizes: { schoolName: 16, examTitle: 13, subjectLine: 12, metaRow: 10, instructions: 11, questionText: 12, mcqOption: 11, footer: 9 },
  instructions: 'Attempt all the questions.',
  footerText: 'Good luck! Read each question carefully.',
  questionStyle: { showMarks: true, numberingStyle: 'number', spacing: 10 },
  questionLayout: { columns: 1, mcqColumns: 2, showAnswerLines: false, answerLineCount: 0, showDateNameFields: false },
  layout: { twinColumns: false, lineHeight: 1.5, headerSpacing: 5, sectionSpacing: 10, columnGap: 14, cutLine: 'dashed' },
}

// Saved templates reuse the full-featured TemplateRenderer so every control
// exposed in the editor (compactness, twin tear-off columns, orientation, …)
// is reflected identically in both the page-editor preview and the PDF/print output.
export function createSavedTemplateDefinition(template: SavedTemplate): TemplateDefinition {
  const orientation = template.orientation ?? 'portrait'
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    orientation,
    config: template.config,
    PreviewComponent: ({ metadata, questions }: TemplateDataProps) => (
      <TemplatePreviewRenderer metadata={metadata} questions={questions} config={template.config} orientation={orientation} />
    ),
    PdfDocument: ({ metadata, questions }: TemplateDataProps) => (
      <TemplatePdfRenderer metadata={metadata} questions={questions} config={template.config} orientation={orientation} />
    ),
  }
}
