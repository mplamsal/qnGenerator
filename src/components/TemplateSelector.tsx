import React from 'react'
import { templates } from '../templates'

type Props = {
  value: string
  onChange: (templateId: string) => void
}

export default function TemplateSelector({ value, onChange }: Props) {
  return (
    <div className="card" style={{ marginBottom: '18px' }}>
      <div className="card-title">🧩 Page Format</div>
      <div className="input-group">
        <label>Template</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-muted">Choose the document layout used for preview and PDF export.</p>
    </div>
  )
}
