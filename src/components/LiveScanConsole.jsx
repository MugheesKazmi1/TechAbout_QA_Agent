import React from 'react';
import { Terminal, Activity, CheckCircle2 } from 'lucide-react';

export default function LiveScanConsole({ scanProgress, isAuditing }) {
  if (!isAuditing && scanProgress?.stage !== 'COMPLETE') return null;

  const progressPct = scanProgress?.progress || 0;

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '28px', border: '1px solid var(--border-glow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#38bdf8" className={isAuditing ? 'spin' : ''} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            AUTONOMOUS AGENT ACTIVE AUDIT FEED
          </span>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {progressPct}% Completed
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: 'rgba(15, 23, 42, 0.9)', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Status Log Stream */}
      <div style={{
        background: '#090d16',
        borderRadius: '10px',
        padding: '12px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.82rem',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Terminal size={16} color="#38bdf8" />
        <span style={{ color: '#f8fafc' }}>{scanProgress?.message || 'Initializing agent browser context...'}</span>
      </div>
    </div>
  );
}
