import React from 'react'
import { useNavigate } from 'react-router-dom'
import { builtInTemplateDefinitions } from '../templates/templateReader'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <div className="landing-header">
        <h1>✨ Welcome to ExamForge</h1>
        <p>Create beautiful, professional exam papers in minutes. Choose a template and start working.</p>
      </div>

      <div className="card">
        <div className="card-title">📚 Choose Your Template</div>
        <div className="template-grid">
          {builtInTemplateDefinitions.map((t) => (
            <div key={t.id} className="template-card">
              <div className="template-card-header">
                <strong>{t.name}</strong>
                <span className="template-tag">{t.orientation || 'portrait'}</span>
              </div>
              <p>{t.description}</p>
              <div>
                <button className="btn btn-primary" type="button" onClick={() => navigate(`/template?templateId=${t.id}`)}>
                  Use template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
