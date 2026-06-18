import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { savePaper, updatePaper as localUpdatePaper } from '../lib/localStore';
import DocumentPreview from './DocumentPreview';
import PDFPreview from './PDFPreview';
import TemplateSelector from './TemplateSelector';
import SavedTemplateManager from './SavedTemplateManager';
import TemplateEditor from './TemplateEditor';
import QuestionEditor from './QuestionEditor';
import { getTemplateById, templates as builtInTemplates } from '../templates';
import { createQuestion, DEFAULT_METADATA, type PaperMetadata, type Question } from '../types/paper';
import { fetchSavedTemplates, saveSavedTemplate, type SavedTemplate } from '../lib/templateApi';
import { DEFAULT_TEMPLATE_CONFIG, createSavedTemplateDefinition } from '../templates/SavedTemplateRenderer';

// --- Main Component ---
export default function PaperEditor() {
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);

  const [templateId, setTemplateId] = useState('exam');
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [templateDraft, setTemplateDraft] = useState<{
    name: string;
    description: string;
    orientation: 'portrait' | 'landscape';
    config: typeof DEFAULT_TEMPLATE_CONFIG;
  }>({
    name: '',
    description: '',
    orientation: 'portrait',
    config: DEFAULT_TEMPLATE_CONFIG,
  });
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [metadata, setMetadata] = useState<PaperMetadata>({ ...DEFAULT_METADATA });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [paperId, setPaperId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50);
  const [splitterActive, setSplitterActive] = useState(false);
  const splitPanelRef = useRef<HTMLDivElement>(null);

  const handleSplitterMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setSplitterActive(true);
  }, []);

  useEffect(() => {
    if (!splitterActive) return;

    const onMove = (e: MouseEvent) => {
      const panel = splitPanelRef.current;
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(78, Math.max(22, pct)));
    };

    const onUp = () => setSplitterActive(false);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [splitterActive]);

  // Init with one empty question
  useEffect(() => {
    if (questions.length === 0) {
      setQuestions([createQuestion('MCQ')]);
    }
  }, [questions.length]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templates = await fetchSavedTemplates({ token: token ?? undefined, schoolId: user?.school_id });
        setSavedTemplates(templates);
      } catch (error) {
        console.warn('Unable to load saved templates', error);
      }
    };
    loadTemplates();
  }, [token, user?.school_id]);

  const savedTemplateDefinitions = useMemo(
    () => savedTemplates.map((template) => createSavedTemplateDefinition(template)),
    [savedTemplates]
  );

  const activeTemplate = useMemo(
    () => savedTemplateDefinitions.find((template) => template.id === templateId) ?? getTemplateById(templateId),
    [savedTemplateDefinitions, templateId]
  );

  const openNewTemplateEditor = () => {
    setEditingTemplate(null);
    setTemplateDraft({ name: '', description: '', orientation: 'portrait', config: DEFAULT_TEMPLATE_CONFIG });
    setTemplateEditorOpen(true);
  };

  const handleEditTemplate = (template: SavedTemplate) => {
    setEditingTemplate(template);
    setTemplateDraft({
      name: template.name,
      description: template.description ?? '',
      orientation: template.orientation ?? 'portrait',
      config: template.config,
    });
    setTemplateEditorOpen(true);
  };

  const handleCancelTemplateEditor = () => {
    setTemplateEditorOpen(false);
    setEditingTemplate(null);
    setTemplateDraft({ name: '', description: '', orientation: 'portrait', config: DEFAULT_TEMPLATE_CONFIG });
  };

  const handleSaveTemplate = async () => {
    if (!templateDraft.name.trim()) return alert('Please enter a template name.');
    setTemplateSaving(true);
    try {
      const saved = await saveSavedTemplate({
        templateId: editingTemplate?.id,
        name: templateDraft.name,
        description: templateDraft.description,
        orientation: templateDraft.orientation,
        config: templateDraft.config,
        token: token ?? undefined,
        schoolId: user?.school_id,
      });

      setSavedTemplates((items) => {
        const existingIndex = items.findIndex((item) => item.id === saved.id);
        if (existingIndex !== -1) {
          const copy = [...items];
          copy[existingIndex] = saved;
          return copy;
        }
        return [saved, ...items];
      });
      setTemplateId(saved.id);
      setTemplateEditorOpen(false);
      setEditingTemplate(null);
      setTemplateDraft({ name: '', description: '', orientation: 'portrait', config: DEFAULT_TEMPLATE_CONFIG });
      alert('Template saved');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Save failed');
    } finally {
      setTemplateSaving(false);
    }
  };

  // --- Question CRUD ---
  const addQuestion = (type: Question['type'] = 'MCQ') => {
    setQuestions((qs) => [...qs, createQuestion(type)]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return alert('Must have at least one question.');
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  };

  const updateQuestion = (updated: Question) => {
    setQuestions((qs) => qs.map((q) => (q.id === updated.id ? updated : q)));
  };

  const moveUp = (i: number) => {
    if (i <= 0) return;
    setQuestions((items) => {
      const copy = [...items];
      [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
      return copy;
    });
  };

  const moveDown = (i: number) => {
    setQuestions((items) => {
      if (i >= items.length - 1) return items;
      const copy = [...items];
      [copy[i], copy[i + 1]] = [copy[i + 1], copy[i]];
      return copy;
    });
  };

  // --- Save / Submit ---
  const handleSaveDraft = async () => {
    if (!user) return alert('Not signed in');
    setSaving(true);
    try {
      const meta = metadata;
      if (!paperId) {
        const created = savePaper({ metadata: meta, questions });
        setPaperId(created.id);
      } else {
        localUpdatePaper(paperId, { metadata: meta, questions });
      }
      alert('Draft saved');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!paperId) {
      await handleSaveDraft();
    }
    if (!paperId) return;
    try {
      localUpdatePaper(paperId, { status: 'Submitted' });
      alert('Submitted for review');
    } catch (err: any) {
      alert(err.message || 'Submit failed');
    }
  };

  // --- Render ---
  return (
    <div ref={splitPanelRef} className={`split-panel${splitterActive ? ' is-dragging' : ''}`}>
      <div className="panel-left" style={{ flex: `0 0 ${leftWidth}%` }}>
        <TemplateSelector
          value={templateId}
          onChange={setTemplateId}
          builtInTemplates={builtInTemplates}
          savedTemplates={savedTemplateDefinitions}
        />

        {templateEditorOpen ? (
          <TemplateEditor
            name={templateDraft.name}
            description={templateDraft.description}
            orientation={templateDraft.orientation}
            config={templateDraft.config}
            onChangeName={(name) => setTemplateDraft((draft) => ({ ...draft, name }))}
            onChangeDescription={(description) => setTemplateDraft((draft) => ({ ...draft, description }))}
            onChangeOrientation={(orientation) => setTemplateDraft((draft) => ({ ...draft, orientation }))}
            onChangeConfig={(config) => setTemplateDraft((draft) => ({ ...draft, config }))}
            onSave={handleSaveTemplate}
            onCancel={handleCancelTemplateEditor}
            saving={templateSaving}
          />
        ) : (
          <SavedTemplateManager
            savedTemplates={savedTemplates}
            selectedTemplateId={templateId}
            onSelect={setTemplateId}
            onEdit={handleEditTemplate}
            onNew={openNewTemplateEditor}
          />
        )}

        <div className="card">
          <div className="card-title">📋 Paper Metadata</div>
          <div className="meta-grid">
            <div className="input-group">
              <label>Subject</label>
              <input
                type="text"
                value={metadata.subject}
                onChange={(e) => setMetadata((m) => ({ ...m, subject: e.target.value }))}
                placeholder="e.g. Mathematics"
              />
            </div>
            <div className="input-group">
              <label>Grade / Class</label>
              <input
                type="text"
                value={metadata.grade}
                onChange={(e) => setMetadata((m) => ({ ...m, grade: e.target.value }))}
                placeholder="e.g. Grade 10"
              />
            </div>
            <div className="input-group">
              <label>Exam Type</label>
              <input
                type="text"
                value={metadata.examType}
                onChange={(e) => setMetadata((m) => ({ ...m, examType: e.target.value }))}
                placeholder="e.g. Final"
              />
            </div>
            <div className="input-group">
              <label>Duration</label>
              <input
                type="text"
                value={metadata.duration}
                onChange={(e) => setMetadata((m) => ({ ...m, duration: e.target.value }))}
                placeholder="e.g. 3 hours"
              />
            </div>
            <div className="input-group">
              <label>Full Marks</label>
              <input
                type="text"
                value={metadata.fullMarks}
                onChange={(e) => setMetadata((m) => ({ ...m, fullMarks: e.target.value }))}
                placeholder="e.g. 100"
              />
            </div>
            <div className="input-group">
              <label>Academic Year</label>
              <input
                type="text"
                value={metadata.academicYear}
                onChange={(e) => setMetadata((m) => ({ ...m, academicYear: e.target.value }))}
                placeholder="e.g. 2025"
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={metadata.includeSet}
                  onChange={(e) =>
                    setMetadata((m) => ({
                      ...m,
                      includeSet: e.target.checked,
                      set: e.target.checked ? m.set : '',
                    }))
                  }
                />
                Include Set
              </label>
              <input
                type="text"
                value={metadata.set}
                onChange={(e) => setMetadata((m) => ({ ...m, set: e.target.value }))}
                placeholder="e.g. A"
                disabled={!metadata.includeSet}
              />
            </div>
          </div>
        </div>

        {/* Questions Card */}
        <div className="card">
          <div className="card-title">
            📝 Questions
            <span className="badge">{questions.length}</span>
          </div>
          <div className="question-list">
            {questions.map((q, idx) => (
              <QuestionEditor
                key={q.id}
                item={q}
                index={idx}
                canMoveDown={idx < questions.length - 1}
                onChange={updateQuestion}
                onRemove={removeQuestion}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
              />
            ))}
          </div>
          <div className="add-question-area">
            <button className="btn btn-outline-primary btn-sm" onClick={() => addQuestion('MCQ')}>
              + MCQ
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => addQuestion('Very Short')}>
              + Very Short
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => addQuestion('Short')}>
              + Short
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => addQuestion('Long')}>
              + Long
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="card no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: 0 }}>
          <button className="btn btn-primary" onClick={handleSaveDraft} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Draft'}
          </button>
          <button className="btn btn-success" onClick={handleSubmit}>
            📤 Submit
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setQuestions([createQuestion('MCQ')]);
              setMetadata({ ...DEFAULT_METADATA });
              setTemplateId('exam');
              setPaperId(null);
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>

      <div
        className={`splitter${splitterActive ? ' active' : ''}`}
        onMouseDown={handleSplitterMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(leftWidth)}
      >
        <div className="grip">
          <span /><span /><span />
        </div>
      </div>

      <div className="panel-right">
        <div className="preview-card preview-card-fill">
          <DocumentPreview template={activeTemplate} metadata={metadata} questions={questions} />
        </div>
        <div className="preview-card no-print preview-card-compact">
          <div className="preview-toolbar">
            <span>🖨️ PDF Preview</span>
          </div>
          <div className="preview-body preview-body-compact">
            <PDFPreview template={activeTemplate} metadata={metadata} questions={questions} />
          </div>
        </div>
      </div>
    </div>
  );
}