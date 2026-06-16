import { apiPost } from './supabaseClient'

export async function createDraftPaper(payload: { metadata: any, questions: any[], token?: string }){
  const res = await apiPost('/papers', { metadata: payload.metadata, questions: payload.questions }, payload.token)
  if(res.error) throw new Error(res.error)
  return res
}

export async function updatePaper(paperId: string, payload: { metadata: any, questions: any[], token?: string }){
  const res = await fetch(`${(import.meta.env.VITE_API_BASE || '/api')}/papers`, { method: 'PUT', headers: { 'content-type': 'application/json', ...(payload.token?{ Authorization: `Bearer ${payload.token}` }: {}) }, body: JSON.stringify({ paperId, metadata: payload.metadata, questions: payload.questions }) })
  return res.json()
}

export async function fetchPapersForTeacher(teacherId: string, token?: string){
  const base = (import.meta.env.VITE_API_BASE || '/api')
  const res = await fetch(`${base}/papers?teacherId=${teacherId}`, { headers: { ...(token?{ Authorization: `Bearer ${token}` }: {}) } })
  return res.json()
}

export async function submitPaper(paperId: string, token?: string){
  const base = (import.meta.env.VITE_API_BASE || '/api')
  const res = await fetch(`${base}/papers`, { method: 'PUT', headers: { 'content-type':'application/json', ...(token?{ Authorization: `Bearer ${token}` }: {}) }, body: JSON.stringify({ paperId, metadata: {}, questions: [] , status: 'Submitted' }) })
  return res.json()
}
