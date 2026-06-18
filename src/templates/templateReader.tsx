import type { TemplateDefinition, TemplateConfig, TemplateDataProps } from './types'
import { TemplatePreviewRenderer, TemplatePdfRenderer } from './TemplateRenderer'
import builtInTemplates from './data/templates.json'

function createPreviewComponent(config: TemplateConfig, orientation?: 'portrait' | 'landscape') {
  return function TemplatePreview({ metadata, questions }: TemplateDataProps) {
    return <TemplatePreviewRenderer metadata={metadata} questions={questions} config={config} orientation={orientation} />
  }
}

function createPdfComponent(config: TemplateConfig, orientation?: 'portrait' | 'landscape') {
  return function TemplatePdf({ metadata, questions }: TemplateDataProps) {
    return <TemplatePdfRenderer metadata={metadata} questions={questions} config={config} orientation={orientation} />
  }
}

export function createTemplateDefinition(templateJson: any): TemplateDefinition {
  return {
    id: templateJson.id,
    name: templateJson.name,
    description: templateJson.description,
    category: templateJson.category,
    orientation: templateJson.orientation,
    config: templateJson.config,
    PreviewComponent: createPreviewComponent(templateJson.config, templateJson.orientation),
    PdfDocument: createPdfComponent(templateJson.config, templateJson.orientation),
  }
}

export const builtInTemplateDefinitions: TemplateDefinition[] = (
  builtInTemplates as Array<{
    id: string
    name: string
    description?: string
    category?: string
    orientation?: 'portrait' | 'landscape'
    config: TemplateConfig
  }>
).map(createTemplateDefinition)
