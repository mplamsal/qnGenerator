import React from 'react'
import type { TemplateConfig } from '../templates/types'

type Props = {
  name: string
  description: string
  orientation: 'portrait' | 'landscape'
  config: TemplateConfig
  onChangeName: (name: string) => void
  onChangeDescription: (description: string) => void
  onChangeOrientation: (orientation: 'portrait' | 'landscape') => void
  onChangeConfig: (config: TemplateConfig) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
}

type Density = 'compact' | 'cozy' | 'spacious'

const DENSITY_PRESETS: Record<Density, {
  lineHeight: number
  headerSpacing: number
  sectionSpacing: number
  questionSpacing: number
  headerPaddingVertical: number
}> = {
  compact: { lineHeight: 1.25, headerSpacing: 3, sectionSpacing: 6, questionSpacing: 5, headerPaddingVertical: 4 },
  cozy: { lineHeight: 1.5, headerSpacing: 5, sectionSpacing: 10, questionSpacing: 10, headerPaddingVertical: 8 },
  spacious: { lineHeight: 1.8, headerSpacing: 8, sectionSpacing: 16, questionSpacing: 16, headerPaddingVertical: 12 },
}

export default function TemplateEditor({
  name,
  description,
  orientation,
  config,
  onChangeName,
  onChangeDescription,
  onChangeOrientation,
  onChangeConfig,
  onSave,
  onCancel,
  saving,
}: Props) {
  const updateMargin = (field: keyof TemplateConfig['margins'], value: number) => {
    onChangeConfig({ ...config, margins: { ...config.margins, [field]: value } })
  }

  const updateHeader = (field: keyof TemplateConfig['header'], value: boolean) => {
    onChangeConfig({ ...config, header: { ...config.header, [field]: value } })
  }

  const updateHeaderStyle = (field: keyof TemplateConfig['headerStyle'], value: any) => {
    onChangeConfig({ ...config, headerStyle: { ...config.headerStyle, [field]: value } })
  }

  const updateQuestionStyle = (field: keyof TemplateConfig['questionStyle'], value: any) => {
    onChangeConfig({ ...config, questionStyle: { ...config.questionStyle, [field]: value } })
  }

  const updateQuestionLayout = (field: keyof TemplateConfig['questionLayout'], value: any) => {
    onChangeConfig({ ...config, questionLayout: { ...config.questionLayout, [field]: value } })
  }

  const updateLayout = (field: keyof TemplateConfig['layout'], value: any) => {
    onChangeConfig({ ...config, layout: { ...config.layout, [field]: value } })
  }

  const applyDensity = (density: Density) => {
    const preset = DENSITY_PRESETS[density]
    onChangeConfig({
      ...config,
      layout: {
        ...config.layout,
        lineHeight: preset.lineHeight,
        headerSpacing: preset.headerSpacing,
        sectionSpacing: preset.sectionSpacing,
      },
      questionStyle: { ...config.questionStyle, spacing: preset.questionSpacing },
      headerStyle: { ...config.headerStyle, paddingVertical: preset.headerPaddingVertical },
    })
  }

  return (
    <div className="card">
      <div className="card-title">🎨 Page Template Builder</div>
      <div className="input-group">
        <label>Template name</label>
        <input value={name} onChange={(e) => onChangeName(e.target.value)} placeholder="Example: Blue Header Math Exam" />
      </div>
      <div className="input-group">
        <label>Description</label>
        <input value={description} onChange={(e) => onChangeDescription(e.target.value)} placeholder="Optional description" />
      </div>

      <div className="input-group">
        <label>Instructions text</label>
        <textarea
          rows={3}
          value={config.instructions}
          onChange={(e) => onChangeConfig({ ...config, instructions: e.target.value })}
          placeholder="Example: Attempt all questions."
        />
      </div>

      <div className="input-group">
        <label>Footer text</label>
        <input value={config.footerText} onChange={(e) => onChangeConfig({ ...config, footerText: e.target.value })} placeholder="Example: Good luck!" />
      </div>

      {/* ── Page layout ── */}
      <div className="card-subtitle" style={{ fontWeight: 700, margin: '4px 0 8px' }}>📐 Page layout</div>
      <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <label>
          <span>Orientation</span>
          <select value={orientation} onChange={(e) => onChangeOrientation(e.target.value as 'portrait' | 'landscape')}>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </label>
        <label>
          <span>Question columns</span>
          <select
            value={config.questionLayout.columns}
            onChange={(e) => updateQuestionLayout('columns', Number(e.target.value) as 1 | 2)}
          >
            <option value={1}>1 column</option>
            <option value={2}>2 columns</option>
          </select>
        </label>
      </div>

      <div className="input-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={config.layout.twinColumns}
            onChange={(e) => updateLayout('twinColumns', e.target.checked)}
          />
          Two tear-off copies (twin) — print two identical papers side by side
        </label>
        <small style={{ color: '#6b7280' }}>
          Best with landscape: prints the same paper twice on one A4 with a dashed cut line so you can tear the sheet in half.
        </small>
      </div>

      {/* ── Compactness ── */}
      <div className="card-subtitle" style={{ fontWeight: 700, margin: '8px 0' }}>↕️ Compactness</div>
      <div className="input-group">
        <label>Density preset</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['compact', 'cozy', 'spacious'] as Density[]).map((d) => (
            <button key={d} type="button" className="btn btn-ghost btn-sm" onClick={() => applyDensity(d)}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="meta-grid">
        <div className="input-group">
          <label>Line height</label>
          <input
            type="number"
            step="0.05"
            value={config.layout.lineHeight}
            onChange={(e) => updateLayout('lineHeight', Number(e.target.value) || 1)}
          />
        </div>
        <div className="input-group">
          <label>Header box spacing (pt)</label>
          <input
            type="number"
            value={config.layout.headerSpacing}
            onChange={(e) => updateLayout('headerSpacing', Number(e.target.value) || 0)}
          />
        </div>
        <div className="input-group">
          <label>Section spacing (pt)</label>
          <input
            type="number"
            value={config.layout.sectionSpacing}
            onChange={(e) => updateLayout('sectionSpacing', Number(e.target.value) || 0)}
          />
        </div>
        <div className="input-group">
          <label>Question spacing (pt)</label>
          <input
            type="number"
            value={config.questionStyle.spacing}
            onChange={(e) => updateQuestionStyle('spacing', Number(e.target.value) || 0)}
          />
        </div>
        <div className="input-group">
          <label>Header padding ↕ (pt)</label>
          <input
            type="number"
            value={config.headerStyle.paddingVertical}
            onChange={(e) => updateHeaderStyle('paddingVertical', Number(e.target.value) || 0)}
          />
        </div>
        <div className="input-group">
          <label>Header padding ↔ (pt)</label>
          <input
            type="number"
            value={config.headerStyle.paddingHorizontal}
            onChange={(e) => updateHeaderStyle('paddingHorizontal', Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* ── Margins ── */}
      <div className="card-subtitle" style={{ fontWeight: 700, margin: '8px 0' }}>📏 Margins (pt)</div>
      <div className="meta-grid">
        <div className="input-group">
          <label>Top margin</label>
          <input type="number" value={config.margins.top} onChange={(e) => updateMargin('top', Number(e.target.value) || 0)} />
        </div>
        <div className="input-group">
          <label>Right margin</label>
          <input type="number" value={config.margins.right} onChange={(e) => updateMargin('right', Number(e.target.value) || 0)} />
        </div>
        <div className="input-group">
          <label>Bottom margin</label>
          <input type="number" value={config.margins.bottom} onChange={(e) => updateMargin('bottom', Number(e.target.value) || 0)} />
        </div>
        <div className="input-group">
          <label>Left margin</label>
          <input type="number" value={config.margins.left} onChange={(e) => updateMargin('left', Number(e.target.value) || 0)} />
        </div>
      </div>

      {/* ── Header content ── */}
      <div className="card-subtitle" style={{ fontWeight: 700, margin: '8px 0' }}>🏫 Header</div>
      <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <label>
          <input
            type="checkbox"
            checked={config.header.enabled}
            onChange={(e) => updateHeader('enabled', e.target.checked)}
          />
          Show header
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.header.showMetaRow}
            onChange={(e) => updateHeader('showMetaRow', e.target.checked)}
          />
          Show class / marks row
        </label>
      </div>

      <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <label>
          <input
            type="checkbox"
            checked={config.header.showSchoolName}
            onChange={(e) => updateHeader('showSchoolName', e.target.checked)}
          />
          Show school name
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.header.showExamTitle}
            onChange={(e) => updateHeader('showExamTitle', e.target.checked)}
          />
          Show exam title
        </label>
      </div>

      <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <label>
          <input
            type="checkbox"
            checked={config.header.showSubjectLine}
            onChange={(e) => updateHeader('showSubjectLine', e.target.checked)}
          />
          Show subject line
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.headerStyle.showLogo}
            onChange={(e) => updateHeaderStyle('showLogo', e.target.checked)}
          />
          Show logo
        </label>
      </div>

      <div className="input-group">
        <label>Header border</label>
        <select
          value={config.headerStyle.borderStyle}
          onChange={(e) => updateHeaderStyle('borderStyle', e.target.value)}
        >
          <option value="box">Box</option>
          <option value="bottom-line">Bottom line</option>
          <option value="none">None</option>
        </select>
      </div>

      {/* ── Questions ── */}
      <div className="card-subtitle" style={{ fontWeight: 700, margin: '8px 0' }}>📝 Questions</div>
      <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <label>
          <span>Question numbers</span>
          <select
            value={config.questionStyle.numberingStyle}
            onChange={(e) => updateQuestionStyle('numberingStyle', e.target.value)}
          >
            <option value="number">1, 2, 3...</option>
            <option value="letter">a, b, c...</option>
          </select>
        </label>
        <label>
          <span>MCQ option columns</span>
          <select
            value={config.questionLayout.mcqColumns}
            onChange={(e) => updateQuestionLayout('mcqColumns', Number(e.target.value) as 1 | 2 | 4)}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </label>
      </div>

      <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <label>
          <input
            type="checkbox"
            checked={config.questionStyle.showMarks}
            onChange={(e) => updateQuestionStyle('showMarks', e.target.checked)}
          />
          Show marks
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.questionLayout.showDateNameFields}
            onChange={(e) => updateQuestionLayout('showDateNameFields', e.target.checked)}
          />
          Show name / date fields
        </label>
      </div>

      <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'end' }}>
        <label>
          <input
            type="checkbox"
            checked={config.questionLayout.showAnswerLines}
            onChange={(e) => updateQuestionLayout('showAnswerLines', e.target.checked)}
          />
          Show answer lines
        </label>
        <label>
          <span>Answer line count</span>
          <input
            type="number"
            min={0}
            value={config.questionLayout.answerLineCount}
            disabled={!config.questionLayout.showAnswerLines}
            onChange={(e) => updateQuestionLayout('answerLineCount', Number(e.target.value) || 0)}
          />
        </label>
      </div>

      <div className="card-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save template'}
        </button>
        <button className="btn btn-ghost" onClick={onCancel} type="button">
          Cancel
        </button>
      </div>
    </div>
  )
}
