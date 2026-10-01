import React from 'react';
import { X, FileText, Code, FileCode, Download } from 'lucide-react';

export default function ReportExporter({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleDownload = (format) => {
    window.open(`/api/audit/export?format=${format}`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-card)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={20} color="#38bdf8" />
            Export TechAbout.com QA Report
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Choose format to download full QA findings, reproduction steps, evidence logs, and AI remediation recommendations.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <button onClick={() => handleDownload('markdown')} className="btn-secondary" style={{ padding: '14px', justifyContent: 'flex-start' }}>
            <FileText size={20} color="#38bdf8" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>Markdown Format (.md)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GitHub Flavored Markdown report ready for documentation</div>
            </div>
          </button>

          <button onClick={() => handleDownload('html')} className="btn-secondary" style={{ padding: '14px', justifyContent: 'flex-start' }}>
            <FileCode size={20} color="#10b981" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>HTML Web Report (.html)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Interactive web page report with formatted styling</div>
            </div>
          </button>

          <button onClick={() => handleDownload('json')} className="btn-secondary" style={{ padding: '14px', justifyContent: 'flex-start' }}>
            <Code size={20} color="#8b5cf6" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>Raw Audit JSON (.json)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Structured JSON data for CI/CD pipeline integration</div>
            </div>
          </button>

        </div>

      </div>
    </div>
  );
}
