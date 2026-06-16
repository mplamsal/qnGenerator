import React, { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store/useStore';
import { savePaper, updatePaper as localUpdatePaper } from '../lib/localStore';
import DocumentPreview from './DocumentPreview';
import PDFPreview from './PDFPreview';

type Question = {
  id: string;
  type: 'MCQ' | 'Very Short' | 'Short' | 'Long';
  question_text: string;
  marks: number;
  instructions?: string;
};

// --- Subcomponent: SortableItem ---
function SortableItem({
  item,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  item: Question;
  index: number;
  onChange: (q: Question) => void;
  onRemove: (id: string) => void;
  onMoveUp: (i: number) => void;
  onMoveDown: (i: number) => void;
}) {
  return (
    <div className="question-item-editor">
      <div className="q-header">
        <span className="q-number">Q{index + 1}</span>
        <div className="q-actions">
          <button onClick={() => onMoveUp(index)} disabled={index === 0}>↑</button>
          <button onClick={() => onMoveDown(index)} disabled={index === 0}>↓</button>
          <button className="remove-btn" onClick={() => onRemove(item.id)}>✕</button>
        </div>
      </div>
      <div className="q-body">
        <div className="q-row">
          <div className="q-field">
            <select
              value={item.type}
              onChange={(e) => onChange({ ...item, type: e.target.value as any })}
            >
              <option>MCQ</option>
              <option>Very Short</option>
              <option>Short</option>
              <option>Long</option>
            </select>
          </div>
          <div className="q-field">
            <input
              type="number"
              value={item.marks}
              onChange={(e) => onChange({ ...item, marks: Number(e.target.value) })}
              placeholder="Marks"
            />
          </div>
        </div>
        <textarea
          value={item.question_text}
          onChange={(e) => onChange({ ...item, question_text: e.target.value })}
          placeholder="Question text"
        />
      </div>
    </div>
  );
}

// --- Main Component ---
export default function PaperEditor() {
  const user = useStore((s) => s.user);

  const [metadata, setMetadata] = useState({
    subject: '',
    grade: '',
    examType: '',
    duration: '',
    fullMarks: '',
    academicYear: '',
    schoolName: 'SOS Hermann Gmeiner School, Sanothimi Bhaktapur',
    includeSet: false,
    set: '',
  });

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
      setQuestions([{ id: uuidv4(), type: 'MCQ', question_text: '', marks: 1 }]);
    }
  }, []);

  // --- Question CRUD ---
  const addQuestion = (type: Question['type'] = 'MCQ') => {
    setQuestions((qs) => [
      ...qs,
      { id: uuidv4(), type, question_text: '', marks: type === 'MCQ' ? 1 : type === 'Very Short' ? 1 : type === 'Short' ? 5 : 10 },
    ]);
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
        {/* Metadata Card */}
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
              <SortableItem
                key={q.id}
                item={q}
                index={idx}
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
              setQuestions([{ id: uuidv4(), type: 'MCQ', question_text: '', marks: 1 }]);
              setMetadata({
                subject: '',
                grade: '',
                examType: '',
                duration: '',
                fullMarks: '',
                academicYear: '',
                schoolName: 'SOS Hermann Gmeiner School, Sanothimi Bhaktapur',
                includeSet: false,
                set: '',
              });
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
          <DocumentPreview metadata={metadata} questions={questions} />
        </div>
        <div className="preview-card no-print preview-card-compact">
          <div className="preview-toolbar">
            <span>🖨️ PDF Preview</span>
          </div>
          <div className="preview-body preview-body-compact">
            <PDFPreview metadata={metadata} questions={questions} />
          </div>
        </div>
      </div>
    </div>
  );
}