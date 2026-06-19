import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import TeacherDashboard from './pages/TeacherDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Landing from './pages/Landing'
import TemplateViewer from './pages/TemplateViewer'
import PaperEditor from './components/PaperEditor'
import { useStore } from './store/useStore'

export default function Router(){
  // App runs with demo user during development — skip sign-in flow
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/teacher" element={<TeacherDashboard/>} />
      <Route path="/admin" element={<AdminDashboard/>} />
      <Route path="/template" element={<TemplateViewer/>} />
      <Route path="/paper" element={<PaperEditor/>} />
      <Route path="/" element={<Landing/>} />
    </Routes>
  )
}
