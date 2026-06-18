import type { TemplateConfig } from '../templates/types'

export type SavedTemplate = {
  id: string
  name: string
  description?: string
  category?: string
  orientation?: 'portrait' | 'landscape'
  config: TemplateConfig
  createdAt?: string
}
