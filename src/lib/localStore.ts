import { v4 as uuidv4 } from 'uuid'

type StoredPaper = {
  id: string
  metadata: any
  questions: any[]
  status: string
  createdAt: string
}

const KEY = 'examforge_local_papers'

function loadAll(): StoredPaper[]{
  try{
    const raw = localStorage.getItem(KEY)
    if(!raw) return []
    return JSON.parse(raw) as StoredPaper[]
  }catch(e){ return [] }
}

function saveAll(items: StoredPaper[]){
  localStorage.setItem(KEY, JSON.stringify(items))
  try { window.dispatchEvent(new CustomEvent('examforge:papers-changed', { detail: items })) } catch (e) {}
}

export function savePaper(payload: { metadata:any, questions:any[] }){
  const items = loadAll()
  const paper: StoredPaper = { id: uuidv4(), metadata: payload.metadata, questions: payload.questions, status: 'Draft', createdAt: new Date().toISOString() }
  items.unshift(paper)
  saveAll(items)
  return paper
}

export function updatePaper(id: string, payload: { metadata?:any, questions?:any[], status?:string }){
  const items = loadAll()
  const idx = items.findIndex(p=>p.id===id)
  if(idx===-1) return null
  const it = items[idx]
  items[idx] = { ...it, metadata: payload.metadata ?? it.metadata, questions: payload.questions ?? it.questions, status: payload.status ?? it.status }
  saveAll(items)
  return items[idx]
}

export function listPapers(){
  return loadAll()
}

export function getPaper(id:string){
  return loadAll().find(p=>p.id===id) || null
}

export function clearAll(){
  localStorage.removeItem(KEY)
}

export type { StoredPaper }
