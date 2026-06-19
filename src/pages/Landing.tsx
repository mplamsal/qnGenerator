import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { listTemplates } from '../lib/templateLocalStore'
import { listPapers } from '../lib/localStore'
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

  const [savedTemplates, setSavedTemplates] = useState<any[]>([])
  const [savedPapers, setSavedPapers] = useState<any[]>([])

  useEffect(() => {
    try {
      const items = listTemplates()
      setSavedTemplates(items)
    } catch (e) {
      setSavedTemplates([])
    }
    try {
      const papers = listPapers()
      setSavedPapers(papers)
    } catch (e) {
      setSavedPapers([])
    }

    const onTemplatesChange = () => {
      try { setSavedTemplates(listTemplates()) } catch (e) { /* ignore */ }
    }
    const onPapersChange = () => {
      try { setSavedPapers(listPapers()) } catch (e) { /* ignore */ }
    }
    window.addEventListener('examforge:templates-changed', onTemplatesChange as EventListener)
    window.addEventListener('examforge:papers-changed', onPapersChange as EventListener)
    return () => {
      window.removeEventListener('examforge:templates-changed', onTemplatesChange as EventListener)
      window.removeEventListener('examforge:papers-changed', onPapersChange as EventListener)
    }
  }, [])

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {savedTemplates.length > 0 ? (
              <div style={{ background: '#e8f0fe', padding: '6px 10px', borderRadius: 6, display: 'flex', gap: 8 }}>
                {savedTemplates.slice(0,6).map((t) => (
                  <button key={t.id} type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(`/paper?templateId=${t.id}`)}>
                    {t.name}
                  </button>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/paper')}>Manage</button>
              </div>
            ) : null}
            <div className="gdocs-avatar">E</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="gdocs-main">
        {/* Saved Papers Section */}
        {savedPapers.length > 0 && (
          <div className="gdocs-start-section">
            <div className="gdocs-start-heading">📋 Continue your work</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {savedPapers.map((paper) => (
                <button
                  key={paper.id}
                  type="button"
                  onClick={() => navigate(`/paper?paperId=${paper.id}`)}
                  style={{
                    background: '#fff',
                    border: '1px solid #d0d0d0',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
                  onMouseOut={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{paper.metadata?.subject || 'Untitled'}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {paper.metadata?.grade} • {paper.metadata?.examType}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                    {paper.questions?.length || 0} questions
                  </div>
                  <div style={{ fontSize: '10px', color: '#bbb', marginTop: '4px' }}>
                    {new Date(paper.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

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
                    onClick={() => navigate(`/paper?templateId=${t.id}`)}
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
