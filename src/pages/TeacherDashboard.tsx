import React, { useEffect, useState } from 'react'
import PaperEditor from '../components/PaperEditor'
import { useStore } from '../store/useStore'
import { listPapers } from '../lib/localStore'

export default function TeacherDashboard(){
  const user = useStore(s=>s.user)
  const [papers, setPapers] = useState<any[]>([])

  useEffect(()=>{
    if(!user) return
    const papers = listPapers()
    setPapers(papers)
  },[user])

  return (
    <div className="p-6 container">
      <header className="header">
        <h2>Teacher Dashboard</h2>
      </header>
      <main>
        <section className="mb-4">
          <h3 className="mb-2">Create / Edit Paper</h3>
          <PaperEditor />
        </section>

        <section>
          <h3 className="mb-2">Previous Papers</h3>
          <div className="card">
            {papers.length===0 ? <p className="muted">No papers yet.</p> : (
              <ul>
                {papers.map(p=> (
                  <li key={p.id} className="list-item">
                    <div>
                      <div style={{fontWeight:600}}>{p.metadata_json?.subject || 'Untitled'}</div>
                      <div className="muted">{p.status} • {new Date(p.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-primary">Preview</button>
                      <button className="btn btn-success">Edit</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
