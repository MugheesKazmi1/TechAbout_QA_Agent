import React, { useState } from 'react';
import { Search, Filter, ExternalLink, Eye, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function IssueMatrix({ issues, onSelectIssue }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const categories = ['ALL', 'Functionality', 'UI/UX', 'Performance', 'Accessibility', 'SEO', 'Technical'];
  const severities = ['ALL', 'Critical', 'High', 'Medium', 'Low'];
  const statuses = ['ALL', 'NEW', 'UNRESOLVED', 'REAPPEARED', 'FIXED'];

  // Filter logic
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || issue.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'ALL' || issue.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'ALL' || issue.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      {/* Table Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            QA Findings & Defect Directory
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Discovered technical, UX, and functional defects on TechAbout.com
          </p>
        </div>

        {/* Search & Filter Row */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search bugs or URLs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-card)',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                minWidth: '220px'
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-card)',
              padding: '8px 12px',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Categories</option>
            {categories.filter(c => c !== 'ALL').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-card)',
              padding: '8px 12px',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Severities</option>
            {severities.filter(s => s !== 'ALL').map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-card)',
              padding: '8px 12px',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Statuses</option>
            {statuses.filter(st => st !== 'ALL').map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Severity</th>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px' }}>Issue Description</th>
              <th style={{ padding: '12px 16px' }}>Target URL</th>
              <th style={{ padding: '12px 16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No QA issues match selected filters.
                </td>
              </tr>
            ) : (
              filteredIssues.map((issue) => (
                <tr
                  key={issue.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`status-pill status-${issue.status.toLowerCase()}`}>
                      {issue.status}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge badge-${issue.severity.toLowerCase()}`}>
                      {issue.severity}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
                    {issue.category}
                  </td>

                  <td style={{ padding: '14px 16px', maxWidth: '300px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>
                      {issue.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Selector: {issue.targetSelector || 'DOM'}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      {new URL(issue.url).pathname}
                      <ExternalLink size={12} />
                    </a>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => onSelectIssue(issue)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <Eye size={14} />
                      Inspect Evidence
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
