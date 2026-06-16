import React from 'react';
import PaperEditor from '../components/PaperEditor';

export default function TeacherDashboard() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="10" y1="8" x2="16" y2="8" />
            <line x1="10" y1="12" x2="16" y2="12" />
            <line x1="10" y1="16" x2="13" y2="16" />
          </svg>
          <span>ExamForge</span>
        </div>
        <div className="header-actions">
          <div className="user-badge">
            <span className="avatar">T</span>
            <span className="name">Teacher</span>
          </div>
          <button className="btn btn-ghost btn-sm">Sign out</button>
        </div>
      </header>

      <PaperEditor />
    </div>
  );
}
