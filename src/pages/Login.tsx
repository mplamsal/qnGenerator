import React, { useState } from 'react'
import api from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const navigate = useNavigate()
  const setUser = useStore(s=>s.setUser)

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault()
    const resp = await api.apiPost('/api/login', { email, password })
    if(resp.error) return alert(resp.error)
    const token = resp.token
    // decode basic payload
    const payload = JSON.parse(atob(token.split('.')[1]))
    const profile = { id: payload.userId, role: payload.role, school_id: payload.schoolId, email }
    setUser(profile as any, token)
    localStorage.setItem('examforge_token', token)
    navigate('/')
  }

  return (
    <div className="center-screen">
      <form onSubmit={handleSubmit} className="card login-form">
        <h1 className="mb-4">ExamForge Login</h1>
        <label className="mb-2">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="input mb-2" />
        <label className="mb-2">Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input mb-4" />
        <button className="btn btn-primary" style={{width:'100%'}}>Sign in</button>
      </form>
    </div>
  )
}
