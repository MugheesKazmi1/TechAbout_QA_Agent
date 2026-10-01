import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, ShieldCheck, RefreshCw, AlertTriangle, Code, Terminal, Camera } from 'lucide-react';

export default function IssueDetailModal({ issue, onClose, onReverifyIssue }) {
  const [copied, setCopied] = useState(false);
  const [reverifying, setReverifying] = useState(false);

  if (!issue) return null;

  const handleCopyFix = () => {
    navigator.clipboard.writeText(issue.suggestedFix || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerReverify = async () => {
    setReverifying(true);
    await onReverifyIssue(issue.id);
    setReverifying(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border-card)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className={`status-pill status-${issue.status.toLowerCase()}`}>
                {issue.status}
              </span>
              <span className={`badge badge-${issue.severity.toLowerCase()}`}>
                {issue.severity} Severity
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                Category: {issue.category}
              </span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
              {issue.title}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'grid', gridTemplateColumns: issue.screenshot ? '1fr 1fr' : '1fr', gap: '24px' }}>
          
          {/* Left Column: Details & Repro */}
          <div>
            {/* Target URL */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Target URL
              </span>
              <div style={{ marginTop: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                <a href={issue.url} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {issue.url}
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Steps to Reproduce */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Steps to Reproduce
              </span>
              <ol style={{ paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.6' }}>
                {issue.stepsToReproduce?.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Expected vs Actual */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
                  Expected Behavior
                </span>
                <p style={{ fontSize: '0.82rem', color: '#e2e8f0', marginTop: '4px' }}>
                  {issue.expectedBehavior}
                </p>
              </div>

              <div style={{ background: 'rgba(244, 63, 94, 0.08)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <span style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 700, textTransform: 'uppercase' }}>
                  Actual Behavior
                </span>
                <p style={{ fontSize: '0.82rem', color: '#e2e8f0', marginTop: '4px' }}>
                  {issue.actualBehavior}
                </p>
              </div>
            </div>

            {/* Technical Evidence Block */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Terminal size={14} color="#38bdf8" />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Technical Evidence & DOM Trace
                </span>
              </div>
              <div style={{ background: '#090d16', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-card)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>
                <div><strong>HTTP Status:</strong> {issue.technicalEvidence?.statusCode || 200}</div>
                <div><strong>Selector:</strong> <code>{issue.targetSelector || 'body'}</code></div>
                <div style={{ marginTop: '6px', color: '#cbd5e1' }}>{issue.technicalEvidence?.context || 'Captured during headless DOM scan.'}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Screenshot & AI Suggested Fix */}
          <div>
            {/* Screenshot Evidence */}
            {issue.screenshot && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Camera size={14} color="#38bdf8" />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Visual Proof Evidence
                  </span>
                </div>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glow)', maxHeight: '240px' }}>
                  <img
                    src={issue.screenshot}
                    alt="Issue Proof"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>
            )}

            {/* AI Suggested Fix */}
            {issue.suggestedFix && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={14} color="#8b5cf6" />
                    <span style={{ fontSize: '0.78rem', color: '#8b5cf6', textTransform: 'uppercase', fontWeight: 700 }}>
                      AI Suggested Fix & Code Snippet
                    </span>
                  </div>
                  <button onClick={handleCopyFix} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                    {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>

                <div style={{ background: '#090d16', padding: '14px', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.3)', maxHeight: '200px', overflowY: 'auto' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    <code>{issue.suggestedFix}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Re-verify Action Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={handleTriggerReverify} disabled={reverifying} className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <RefreshCw size={16} className={reverifying ? 'spin' : ''} />
                {reverifying ? 'Re-verifying Bug...' : 'Re-verify Bug Live'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
