import { listTemplates as listLocalTemplates, saveTemplate as saveTemplateLocal } from './templateLocalStore'

export type { SavedTemplate } from '../types/savedTemplate'
import type { SavedTemplate } from '../types/savedTemplate'
import type { TemplateConfig } from '../templates/types'

export async function fetchSavedTemplates(options?: { token?: string; schoolId?: string }) {
  try {
    const base = import.meta.env.VITE_API_BASE || '/api'
    const query = options?.token ? '' : options?.schoolId ? `?schoolId=${encodeURIComponent(options.schoolId)}` : ''
    const res = await fetch(`${base}/templates${query}`, {
      headers: {
        ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.error || 'Failed to fetch saved templates')
    }
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      orientation: item.orientation,
      config: item.configJson || item.config,
      createdAt: item.createdAt,
    })) as SavedTemplate[]
  } catch (error) {
    return listLocalTemplates() as SavedTemplate[]
  }
}

export async function saveSavedTemplate(payload: {
  templateId?: string
  name: string
  description?: string
  orientation?: 'portrait' | 'landscape'
  config: TemplateConfig
  token?: string
  schoolId?: string
}) {
  try {
    const body = {
      templateId: payload.templateId,
      name: payload.name,
      description: payload.description,
      orientation: payload.orientation,
      config: payload.config,
    }

    const res = await fetch(import.meta.env.VITE_API_BASE ? `${import.meta.env.VITE_API_BASE}/templates` : '/api/templates', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(payload.token ? { Authorization: `Bearer ${payload.token}` } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.error || 'Failed to save template')
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      orientation: data.orientation ?? payload.orientation,
      config: data.configJson || data.config,
      createdAt: data.createdAt,
    } as SavedTemplate
  } catch (error) {
    return saveTemplateLocal({
      templateId: payload.templateId,
      name: payload.name,
      description: payload.description,
      orientation: payload.orientation,
      config: payload.config,
    }) as SavedTemplate
  }
}

// Ensure that successful server saves are also mirrored locally so the UI can show them offline
export async function saveSavedTemplateAndMirrorLocal(payload: {
  templateId?: string
  name: string
  description?: string
  orientation?: 'portrait' | 'landscape'
  config: TemplateConfig
  token?: string
  schoolId?: string
}) {
  const saved = await saveSavedTemplate(payload)
  try {
    // Mirror into local store using server id when available
    saveTemplateLocal({
      templateId: (saved as any).id,
      name: saved.name,
      description: saved.description,
      orientation: saved.orientation,
      config: saved.config,
    })
  } catch (e) {
    // ignore
  }
  return saved
}
