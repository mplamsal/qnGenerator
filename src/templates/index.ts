import { builtInTemplateDefinitions } from './templateReader'
import type { TemplateDefinition } from './types'

export const templates: TemplateDefinition[] = builtInTemplateDefinitions
export const defaultTemplate = templates[0]

export function getTemplateById(id: string): TemplateDefinition {
  return templates.find((template) => template.id === id) ?? defaultTemplate
}
