import { ExamTemplate } from './exam'
import type { TemplateDefinition } from './types'

export const templates: TemplateDefinition[] = [ExamTemplate]

export const defaultTemplate = ExamTemplate

export function getTemplateById(id: string): TemplateDefinition {
  return templates.find((template) => template.id === id) ?? defaultTemplate
}
