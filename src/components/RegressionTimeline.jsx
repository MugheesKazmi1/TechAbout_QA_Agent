import React from 'react';
import { History, TrendingUp, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';

export default function RegressionTimeline({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="#38bdf8" />
            Regression Tracking & Audit History
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Historical audit runs comparing fixed, persistent, and reappeared bugs over time
          </p>
        </div>
      </div>

      {/* Audit Runs Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {history.map((run, index) => {
          const isLatest = index === history.length - 1;
          const dateStr = new Date(run.timestamp).toLocaleString();

          return (
            <div
              key={run.id}
              style={{
                background: isLatest ? 'rgba(56, 189, 248, 0.05)' : 'rgba(15, 23, 42, 0.6)',
                border: isLatest ? '1px solid var(--accent-cyan)' : '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '16px',
                position: 'relative'
              }}
            >
              {isLatest && (
                <span style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '16px',
                  background: '#38bdf8',
                  color: '#090d16',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase'
                }}>
                  Latest Run
                </span>
              )}

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                {run.id} • {dateStr}
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                {run.totalIssues} Active Findings
              </div>

              {/* Status Breakdown Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                <div style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '6px 10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🆕 New</span>
                  <strong>{run.summary?.new || 0}</strong>
                </div>

                <div style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#f97316', padding: '6px 10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>⚠️ Persistent</span>
                  <strong>{run.summary?.unresolved || 0}</strong>
                </div>

                <div style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🔄 Reappeared</span>
                  <strong>{run.summary?.reappeared || 0}</strong>
                </div>

                <div style={{ background: 'rgba(5, 150, 105, 0.15)', color: '#10b981', padding: '6px 10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>✅ Fixed</span>
                  <strong>{run.summary?.fixed || run.fixedIssues?.length || 0}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
