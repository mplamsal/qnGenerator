import { v4 as uuidv4 } from 'uuid'

type StoredTemplate = {
  id: string
  name: string
  description?: string
  orientation?: 'portrait' | 'landscape'
  config: any
  createdAt: string
}

const KEY = 'examforge_local_templates'

function loadAll(): StoredTemplate[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as StoredTemplate[]
  } catch (err) {
    return []
  }
}

function saveAll(items: StoredTemplate[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function listTemplates() {
  return loadAll()
}

export function saveTemplate(payload: { templateId?: string; name: string; description?: string; orientation?: 'portrait' | 'landscape'; config: any }) {
  const items = loadAll()
  if (payload.templateId) {
    const existingIndex = items.findIndex((item) => item.id === payload.templateId)
    if (existingIndex !== -1) {
      const updated = {
        ...items[existingIndex],
        name: payload.name,
        description: payload.description,
        orientation: payload.orientation,
        config: payload.config,
      }
      items[existingIndex] = updated
      saveAll(items)
      return updated
    }
  }

  const template = {
    id: uuidv4(),
    name: payload.name,
    description: payload.description,
    orientation: payload.orientation,
    config: payload.config,
    createdAt: new Date().toISOString(),
  }
  items.unshift(template)
  saveAll(items)
  return template
}
