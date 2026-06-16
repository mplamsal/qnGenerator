import React, { useEffect, useState } from 'react'
import PDFPreview from './PDFPreview'
import DocumentPreview from './DocumentPreview'
import { v4 as uuidv4 } from 'uuid'
import { useStore } from '../store/useStore'
import { savePaper, updatePaper as localUpdatePaper } from '../lib/localStore'

type Question = {
  id: string
  type: 'MCQ'|'Very Short'|'Short'|'Long'
  question_text: string
  marks: number
  instructions?: string
}

function SortableItem({item, index, onChange, onRemove, onMoveUp, onMoveDown}:{item: Question; index:number; onChange:(q:Question)=>void; onRemove:(id:string)=>void; onMoveUp:(i:number)=>void; onMoveDown:(i:number)=>void}){
  return (
    <div className="p-3 border rounded mb-2 bg-white">
      <div className="flex items-center justify-between mb-2">
        <strong>Q {index+1}</strong>
        <div className="flex gap-2">
          <button onClick={()=>onMoveUp(index)} className="px-2 py-1 bg-gray-100 rounded">Up</button>
          <button onClick={()=>onMoveDown(index)} className="px-2 py-1 bg-gray-100 rounded">Down</button>
          <button onClick={()=>onRemove(item.id)} className="px-2 py-1 bg-red-100 rounded">Remove</button>
        </div>
      </div>
      <select value={item.type} onChange={e=>onChange({...item, type: e.target.value as any})} className="mb-2 w-full p-2 border rounded">
        <option>MCQ</option>
        <option>Very Short</option>
        <option>Short</option>
        <option>Long</option>
      </select>
      <textarea value={item.question_text} onChange={e=>onChange({...item, question_text: e.target.value})} placeholder="Question text" className="w-full p-2 border rounded mb-2" />
      <input type="number" value={item.marks} onChange={e=>onChange({...item, marks: Number(e.target.value)})} className="w-full p-2 border rounded" />
    </div>
  )
}

export default function PaperEditor(){
  const user = useStore(s=>s.user)
  const [metadata, setMetadata] = useState({subject:'', grade:'', examType:'', duration:'', fullMarks:'', academicYear:''})
  const [questions, setQuestions] = useState<Question[]>([])
  const [saving, setSaving] = useState(false)
  const [paperId, setPaperId] = useState<string | null>(null)

  useEffect(()=>{
    // init with one question
    if(questions.length===0) setQuestions([{id: uuidv4(), type: 'MCQ', question_text: '', marks: 1}])
  },[])

  function addQuestion(){
    setQuestions(qs=>[...qs, {id: uuidv4(), type: 'MCQ', question_text: '', marks: 1}])
  }

  function removeQuestion(id:string){
    setQuestions(qs=>qs.filter(q=>q.id!==id))
  }

  function updateQuestion(updated:Question){
    setQuestions(qs=>qs.map(q=> q.id===updated.id ? updated : q))
  }

  async function handleSaveDraft(){
    if(!user) return alert('Not signed in')
    setSaving(true)
    try{
      const meta = metadata
      if(!paperId){
        const created = savePaper({ metadata: meta, questions })
        setPaperId(created.id)
      } else {
        localUpdatePaper(paperId, { metadata: meta, questions })
      }
      alert('Saved draft')
    }catch(err:any){
      console.error(err)
      alert(err.message || 'Save failed')
    }finally{ setSaving(false) }
  }

  async function handleSubmit(){
    if(!paperId){
      await handleSaveDraft()
    }
    if(!paperId) return
    try{
      localUpdatePaper(paperId, { status: 'Submitted' })
      alert('Submitted for review')
    }catch(err:any){
      alert(err.message || 'Submit failed')
    }
  }

  function moveUp(i:number){
    if(i<=0) return
    setQuestions(items=>{
      const copy = [...items]
      const tmp = copy[i-1]
      copy[i-1] = copy[i]
      copy[i] = tmp
      return copy
    })
  }
  function moveDown(i:number){
    setQuestions(items=>{
      if(i>=items.length-1) return items
      const copy = [...items]
      const tmp = copy[i+1]
      copy[i+1] = copy[i]
      copy[i] = tmp
      return copy
    })
  }

  return (
    <div className="grid grid-cols-3 container">
      <section className="card">
        <h3 className="mb-2">Preview</h3>
        <DocumentPreview metadata={{ ...metadata, schoolName: 'SOS Hermann Gmeiner School, Sanothimi Bhaktapur' }} questions={questions} />
        <div style={{marginTop:12}}>
          <PDFPreview metadata={{ ...metadata, schoolName: 'SOS Hermann Gmeiner School, Sanothimi Bhaktapur' }} questions={questions} />
        </div>
      </section>


      <div>

      <section className="card">
        <h3 className="mb-2">Questions</h3>
        <div>
          {questions.map((q, idx)=> (
            <SortableItem key={q.id} item={q} index={idx} onChange={updateQuestion} onRemove={removeQuestion} onMoveUp={moveUp} onMoveDown={moveDown} />
          ))}
        </div>
        <div className="mt-2">
          <button onClick={addQuestion} className="btn btn-primary">Add Question</button>
        </div>
      </section>


        <section className="card">
        <h3 className="mb-2">Paper Metadata</h3>
        <div>
          <input value={metadata.subject} onChange={e=>setMetadata(m=>({...m, subject: e.target.value}))} placeholder="Subject" className="input mb-2" />
          <input value={metadata.grade} onChange={e=>setMetadata(m=>({...m, grade: e.target.value}))} placeholder="Grade/Class" className="input mb-2" />
          <input value={metadata.examType} onChange={e=>setMetadata(m=>({...m, examType: e.target.value}))} placeholder="Exam Type" className="input mb-2" />
          <input value={metadata.duration} onChange={e=>setMetadata(m=>({...m, duration: e.target.value}))} placeholder="Duration" className="input mb-2" />
          <input value={metadata.fullMarks} onChange={e=>setMetadata(m=>({...m, fullMarks: e.target.value}))} placeholder="Full Marks" className="input mb-2" />
          <input value={metadata.academicYear} onChange={e=>setMetadata(m=>({...m, academicYear: e.target.value}))} placeholder="Academic Year" className="input mb-2" />
        </div>
        <div className="mt-2" style={{display:'flex', gap:8}}>
          <button onClick={handleSaveDraft} disabled={saving} className="btn" style={{background:'#1f2937',color:'#fff'}}>{saving? 'Saving...':'Save Draft'}</button>
          <button onClick={handleSubmit} className="btn btn-success">Submit</button>
        </div>
      </section>

  </div>

    </div>
  )
}
