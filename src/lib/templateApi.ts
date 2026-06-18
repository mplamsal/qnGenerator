import { listTemplates as listLocalTemplates, saveTemplate as saveTemplateLocal } from './templateLocalStore'

export type { SavedTemplate } from '../types/savedTemplate'
import type { SavedTemplate } from '../types/savedTemplate'

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
  config: TemplateConfig
  token?: string
  schoolId?: string
}) {
  try {
    const body = {
      templateId: payload.templateId,
      name: payload.name,
      description: payload.description,
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
      config: data.configJson || data.config,
      createdAt: data.createdAt,
    } as SavedTemplate
  } catch (error) {
    return saveTemplateLocal({
      templateId: payload.templateId,
      name: payload.name,
      description: payload.description,
      config: payload.config,
    }) as SavedTemplate
  }
}
