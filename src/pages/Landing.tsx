import React from 'react'
import { useNavigate } from 'react-router-dom'
import { builtInTemplateDefinitions } from '../templates/templateReader'
import type { TemplateDefinition } from '../templates/types'

const CATEGORY_ORDER = ['Terminal Exam', 'Unit Test', 'Special Format']

function TemplateThumbnail({ orientation }: { orientation?: string }) {
  const isLandscape = orientation === 'landscape'
  const w = isLandscape ? 108 : 76
  const h = isLandscape ? 76 : 108

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <rect width={w} height={h} fill="#fff" stroke="#dadce0" strokeWidth="1" />
      {/* Header box */}
      <rect x="5" y="5" width={w - 10} height="16" fill="none" stroke="#c0c7d0" strokeWidth="0.7" />
      <rect x="8" y="7.5" width="10" height="10" fill="#e8eaf0" rx="1" />
      <rect x="23" y="8.5" width={w - 48} height="3" fill="#c8cdd6" rx="0.5" />
      <rect x="23" y="13" width={w - 56} height="2.5" fill="#dde1e8" rx="0.5" />
      {/* Instructions line */}
      <rect x="5" y="24" width={w - 10} height="2" fill="#e8eaed" rx="0.5" />
      {/* Question rows */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="5" y={30 + i * 17} width="5" height="5" fill="#eef2f7" rx="0.5" />
          <rect x="13" y={31 + i * 17} width={w - 22} height="2.5" fill="#e0e4eb" rx="0.5" />
          <rect x="13" y={35 + i * 17} width={w - 30} height="2" fill="#eaecf0" rx="0.5" />
        </g>
      ))}
    </svg>
  )
}

function TemplateCard({ template, onClick }: { template: TemplateDefinition; onClick: () => void }) {
  return (
    <button type="button" className="gdocs-template-card" onClick={onClick}>
      <div className="gdocs-thumbnail">
        <TemplateThumbnail orientation={template.orientation} />
      </div>
      <div className="gdocs-template-info">
        <div className="gdocs-template-name">{template.name}</div>
        <div className="gdocs-template-desc">{template.description}</div>
      </div>
    </button>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  const grouped = builtInTemplateDefinitions.reduce<Record<string, TemplateDefinition[]>>((acc, t) => {
    const cat = t.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(t)
    return acc
  }, {})

  const categories = CATEGORY_ORDER.filter((c) => grouped[c])

  return (
    <div className="gdocs-landing">
      {/* Top navigation bar */}
      <div className="gdocs-navbar">
        <div className="gdocs-navbar-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="3" fill="#1a73e8" />
            <rect x="6" y="5" width="12" height="2.5" rx="0.5" fill="white" />
            <rect x="6" y="9.5" width="12" height="2" rx="0.5" fill="rgba(255,255,255,0.75)" />
            <rect x="6" y="13.5" width="9" height="2" rx="0.5" fill="rgba(255,255,255,0.55)" />
            <rect x="6" y="17" width="10" height="2" rx="0.5" fill="rgba(255,255,255,0.55)" />
          </svg>
          <span className="gdocs-navbar-title">ExamForge</span>
        </div>
        <div className="gdocs-navbar-right">
          <div className="gdocs-avatar">E</div>
        </div>
      </div>

      {/* Main content */}
      <div className="gdocs-main">
        <div className="gdocs-start-section">
          <div className="gdocs-start-heading">Start a new exam paper</div>

          {categories.map((category) => (
            <div key={category} className="gdocs-category-block">
              <div className="gdocs-category-label">{category}</div>
              <div className="gdocs-template-row">
                {grouped[category].map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onClick={() => navigate(`/template?templateId=${t.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
