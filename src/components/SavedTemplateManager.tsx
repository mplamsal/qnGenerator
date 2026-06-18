import React from 'react'
import type { SavedTemplate } from '../lib/templateApi'

type Props = {
  savedTemplates: SavedTemplate[]
  selectedTemplateId: string
  onSelect: (templateId: string) => void
  onEdit: (template: SavedTemplate) => void
  onNew: () => void
}

export default function SavedTemplateManager({ savedTemplates, selectedTemplateId, onSelect, onEdit, onNew }: Props) {
  return (
    <div className="card" style={{ marginBottom: '18px' }}>
      <div className="card-title">💾 Saved page templates</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="btn btn-outline-primary btn-sm" onClick={onNew} type="button">
          + Create new template
        </button>
        {savedTemplates.length === 0 ? (
          <p className="muted">No saved page templates yet. Create one to reuse layout and margins.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {savedTemplates.map((template) => (
              <div
                key={template.id}
                className={`card ${selectedTemplateId === template.id ? 'card-selected' : ''}`}
                style={{ padding: '10px', cursor: 'pointer' }}
                onClick={() => onSelect(template.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{template.name}</div>
                    {template.description ? <div className="text-sm text-muted">{template.description}</div> : null}
                  </div>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={(e) => { e.stopPropagation(); onEdit(template) }}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
