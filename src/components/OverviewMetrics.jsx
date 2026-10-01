import React from 'react';
import { AlertTriangle, CheckCircle, Bug, Layers, Repeat, ShieldAlert } from 'lucide-react';

export default function OverviewMetrics({ auditData }) {
  if (!auditData) return null;

  const { totalIssues = 0, pagesAudited = 0, summary = {}, fixedIssues = [] } = auditData;
  const criticalHigh = (summary.bySeverity?.critical || 0) + (summary.bySeverity?.high || 0);

  const metrics = [
    {
      title: 'Active Issues',
      value: totalIssues,
      subtitle: `${pagesAudited} pages crawled`,
      icon: Bug,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)'
    },
    {
      title: 'Critical / High Severity',
      value: criticalHigh,
      subtitle: 'Requires immediate fix',
      icon: AlertTriangle,
      color: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.1)'
    },
    {
      title: 'Regression Bugs',
      value: summary.reappeared || 0,
      subtitle: 'Bugs that reappeared',
      icon: Repeat,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'Resolved / Fixed',
      value: fixedIssues.length || summary.fixed || 0,
      subtitle: 'Verified clean in latest audit',
      icon: CheckCircle,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)'
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
      {metrics.map((m, idx) => {
        const IconComp = m.icon;
        return (
          <div key={idx} className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {m.title}
              </span>
              <div style={{ background: m.bg, padding: '8px', borderRadius: '10px' }}>
                <IconComp size={20} color={m.color} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
              {m.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {m.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
