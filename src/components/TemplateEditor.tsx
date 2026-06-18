import React, { useState } from 'react'
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

function activeDensity(config: TemplateConfig): Density | null {
  for (const key of Object.keys(DENSITY_PRESETS) as Density[]) {
    const p = DENSITY_PRESETS[key]
    if (
      config.layout.lineHeight === p.lineHeight &&
      config.layout.headerSpacing === p.headerSpacing &&
      config.layout.sectionSpacing === p.sectionSpacing &&
      config.questionStyle.spacing === p.questionSpacing
    ) {
      return key
    }
  }
  return null
}

function Section({
  icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: string
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`tmpl-section${open ? ' is-open' : ''}`}>
      <button type="button" className="tmpl-section-header" onClick={() => setOpen((v) => !v)}>
        <span className="tmpl-section-icon">{icon}</span>
        <span>{title}</span>
        <span className="tmpl-section-chevron">▼</span>
      </button>
      {open ? <div className="tmpl-section-body">{children}</div> : null}
    </div>
  )
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

  const density = activeDensity(config)

  return (
    <div className="card tmpl-builder">
      <div className="card-title">🎨 Page Template Builder</div>

      <Section icon="📄" title="Basics" defaultOpen>
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
            rows={2}
            value={config.instructions}
            onChange={(e) => onChangeConfig({ ...config, instructions: e.target.value })}
            placeholder="Example: Attempt all questions."
          />
        </div>
        <div className="input-group">
          <label>Footer text</label>
          <input value={config.footerText} onChange={(e) => onChangeConfig({ ...config, footerText: e.target.value })} placeholder="Example: Good luck!" />
        </div>
      </Section>

      <Section icon="📐" title="Page layout" defaultOpen>
        <div className="meta-grid" style={{ marginBottom: 12 }}>
          <div className="input-group">
            <label>Orientation</label>
            <select value={orientation} onChange={(e) => onChangeOrientation(e.target.value as 'portrait' | 'landscape')}>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div className="input-group">
            <label>Question columns</label>
            <select
              value={config.questionLayout.columns}
              onChange={(e) => updateQuestionLayout('columns', Number(e.target.value) as 1 | 2)}
            >
              <option value={1}>1 — single flow</option>
              <option value={2}>2 — split questions</option>
            </select>
          </div>
        </div>
        <div className="input-group">
          <label className="tmpl-check">
            <input
              type="checkbox"
              checked={config.layout.twinColumns}
              onChange={(e) => updateLayout('twinColumns', e.target.checked)}
            />
            Twin tear-off copies
          </label>
          <small className="tmpl-hint">
            Prints two <strong>identical</strong> copies side by side (each half is a complete paper) so a landscape A4 can
            be cut in two. Different from “2 columns”, which splits one paper’s questions across the page.
          </small>
        </div>
        {config.layout.twinColumns ? (
          <div className="input-group">
            <label>Cut line between copies</label>
            <select value={config.layout.cutLine} onChange={(e) => updateLayout('cutLine', e.target.value)}>
              <option value="dashed">Dashed (recommended)</option>
              <option value="solid">Solid</option>
              <option value="none">None</option>
            </select>
          </div>
        ) : null}
        <div className="input-group">
          <label>Column gap (pt)</label>
          <input
            type="number"
            value={config.layout.columnGap}
            onChange={(e) => updateLayout('columnGap', Number(e.target.value) || 0)}
          />
          <small className="tmpl-hint">Horizontal space between columns / twin halves.</small>
        </div>
      </Section>

      <Section icon="↕️" title="Compactness" defaultOpen>
        <div className="input-group">
          <label>Density preset</label>
          <div className="tmpl-density-row">
            {(['compact', 'cozy', 'spacious'] as Density[]).map((d) => (
              <button
                key={d}
                type="button"
                className={`btn btn-ghost btn-sm tmpl-density-btn${density === d ? ' is-active' : ''}`}
                onClick={() => applyDensity(d)}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          <small className="tmpl-hint">Quick presets — fine-tune the exact values below.</small>
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
      </Section>

      <Section icon="📏" title="Margins">
        <div className="meta-grid">
          <div className="input-group">
            <label>Top (pt)</label>
            <input type="number" value={config.margins.top} onChange={(e) => updateMargin('top', Number(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label>Right (pt)</label>
            <input type="number" value={config.margins.right} onChange={(e) => updateMargin('right', Number(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label>Bottom (pt)</label>
            <input type="number" value={config.margins.bottom} onChange={(e) => updateMargin('bottom', Number(e.target.value) || 0)} />
          </div>
          <div className="input-group">
            <label>Left (pt)</label>
            <input type="number" value={config.margins.left} onChange={(e) => updateMargin('left', Number(e.target.value) || 0)} />
          </div>
        </div>
      </Section>

      <Section icon="🏫" title="Header">
        <div className="tmpl-checks">
          <label className="tmpl-check">
            <input type="checkbox" checked={config.header.enabled} onChange={(e) => updateHeader('enabled', e.target.checked)} />
            Show header
          </label>
          <label className="tmpl-check">
            <input type="checkbox" checked={config.header.showMetaRow} onChange={(e) => updateHeader('showMetaRow', e.target.checked)} />
            Class / marks row
          </label>
          <label className="tmpl-check">
            <input type="checkbox" checked={config.header.showSchoolName} onChange={(e) => updateHeader('showSchoolName', e.target.checked)} />
            School name
          </label>
          <label className="tmpl-check">
            <input type="checkbox" checked={config.header.showExamTitle} onChange={(e) => updateHeader('showExamTitle', e.target.checked)} />
            Exam title
          </label>
          <label className="tmpl-check">
            <input type="checkbox" checked={config.header.showSubjectLine} onChange={(e) => updateHeader('showSubjectLine', e.target.checked)} />
            Subject line
          </label>
          <label className="tmpl-check">
            <input type="checkbox" checked={config.headerStyle.showLogo} onChange={(e) => updateHeaderStyle('showLogo', e.target.checked)} />
            Logo
          </label>
        </div>
        <div className="input-group">
          <label>Header border</label>
          <select value={config.headerStyle.borderStyle} onChange={(e) => updateHeaderStyle('borderStyle', e.target.value)}>
            <option value="box">Box</option>
            <option value="bottom-line">Bottom line</option>
            <option value="none">None</option>
          </select>
        </div>
      </Section>

      <Section icon="📝" title="Questions">
        <div className="meta-grid" style={{ marginBottom: 12 }}>
          <div className="input-group">
            <label>Question numbers</label>
            <select value={config.questionStyle.numberingStyle} onChange={(e) => updateQuestionStyle('numberingStyle', e.target.value)}>
              <option value="number">1, 2, 3...</option>
              <option value="letter">a, b, c...</option>
            </select>
          </div>
          <div className="input-group">
            <label>MCQ option columns</label>
            <select
              value={config.questionLayout.mcqColumns}
              onChange={(e) => updateQuestionLayout('mcqColumns', Number(e.target.value) as 1 | 2 | 4)}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </div>
        </div>
        <div className="tmpl-checks">
          <label className="tmpl-check">
            <input type="checkbox" checked={config.questionStyle.showMarks} onChange={(e) => updateQuestionStyle('showMarks', e.target.checked)} />
            Show marks
          </label>
          <label className="tmpl-check">
            <input type="checkbox" checked={config.questionLayout.showDateNameFields} onChange={(e) => updateQuestionLayout('showDateNameFields', e.target.checked)} />
            Name / date fields
          </label>
          <label className="tmpl-check">
            <input type="checkbox" checked={config.questionLayout.showAnswerLines} onChange={(e) => updateQuestionLayout('showAnswerLines', e.target.checked)} />
            Answer lines
          </label>
        </div>
        {config.questionLayout.showAnswerLines ? (
          <div className="input-group">
            <label>Answer line count</label>
            <input
              type="number"
              min={0}
              value={config.questionLayout.answerLineCount}
              onChange={(e) => updateQuestionLayout('answerLineCount', Number(e.target.value) || 0)}
            />
          </div>
        ) : null}
      </Section>

      <div className="card-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: 12 }}>
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
