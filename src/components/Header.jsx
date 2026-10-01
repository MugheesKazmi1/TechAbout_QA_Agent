import React from 'react';
import { Bot, Play, Download, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Header({ targetUrl, setTargetUrl, isAuditing, onStartAudit, onOpenExportModal }) {
  return (
    <header className="glass-panel" style={{ padding: '16px 28px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
          }}>
            <Bot size={28} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              TechAbout Autonomous AI QA Agent
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#10b981" /> Public Website Compliance Auditor • Non-Admin Journey Inspector
            </p>
          </div>
        </div>

        {/* Audit Target Input & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '320px' }}>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://techabout.com"
              disabled={isAuditing}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-glow)',
                padding: '10px 16px',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={onStartAudit}
            disabled={isAuditing}
            className="btn-primary"
            style={{ opacity: isAuditing ? 0.7 : 1 }}
          >
            {isAuditing ? <RefreshCw className="spin" size={18} /> : <Play size={18} />}
            {isAuditing ? 'Auditing Site...' : 'Run Autonomous Audit'}
          </button>

          <button onClick={onOpenExportModal} className="btn-secondary">
            <Download size={18} />
            Export QA Report
          </button>
        </div>
      </div>
    </header>
  );
}
