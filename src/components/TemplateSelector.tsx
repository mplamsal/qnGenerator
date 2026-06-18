import React from 'react'
import type { TemplateDefinition } from '../templates/types'

type Props = {
  value: string
  onChange: (templateId: string) => void
  builtInTemplates: TemplateDefinition[]
  savedTemplates?: TemplateDefinition[]
}

export default function TemplateSelector({
  value,
  onChange,
  builtInTemplates,
  savedTemplates = [],
}: Props) {
  return (
    <div className="card" style={{ marginBottom: '18px' }}>
      <div className="card-title">🧩 Page Format</div>
      <div className="input-group">
        <label>Template</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <optgroup label="Built-in templates">
            {builtInTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </optgroup>
          {savedTemplates.length > 0 ? (
            <optgroup label="Saved templates">
              {savedTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
      </div>
      <p className="text-sm text-muted">Choose the document layout used for preview and PDF export.</p>
    </div>
  )
}
