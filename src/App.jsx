import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OverviewMetrics from './components/OverviewMetrics';
import LiveScanConsole from './components/LiveScanConsole';
import IssueMatrix from './components/IssueMatrix';
import IssueDetailModal from './components/IssueDetailModal';
import RegressionTimeline from './components/RegressionTimeline';
import ReportExporter from './components/ReportExporter';

export default function App() {
  const [targetUrl, setTargetUrl] = useState('https://techabout.com');
  const [auditData, setAuditData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [scanProgress, setScanProgress] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load audit data & history on mount
  useEffect(() => {
    fetchLatestAudit();
    fetchHistory();
  }, []);

  const fetchLatestAudit = async () => {
    try {
      const res = await fetch('/api/audit/latest');
      if (res.ok) {
        const data = await res.json();
        setAuditData(data);
      }
    } catch (err) {
      console.error('Failed to fetch latest audit:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/audit/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  // Trigger Autonomous QA Scan
  const handleStartAudit = async () => {
    setIsAuditing(true);
    setScanProgress({ stage: 'INIT', message: 'Connecting agent browser worker to target domain...', progress: 5 });

    // Poll scan progress
    const interval = setInterval(async () => {
      try {
        const progRes = await fetch('/api/audit/progress');
        if (progRes.ok) {
          const progData = await progRes.json();
          setScanProgress(progData);
        }
      } catch (e) {}
    }, 1000);

    try {
      const res = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, depth: 2, maxPages: 15 })
      });

      clearInterval(interval);

      if (res.ok) {
        const result = await res.json();
        setAuditData(result.auditRecord);
        await fetchHistory();
      }
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      clearInterval(interval);
      setIsAuditing(false);
    }
  };

  // Re-verify single issue
  const handleReverifyIssue = async (issueId) => {
    try {
      const res = await fetch(`/api/audit/reproduce/${issueId}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.reVerified) {
          setSelectedIssue(data.reVerified);
          // Update issue list in state
          setAuditData(prev => ({
            ...prev,
            issues: prev.issues.map(i => i.id === issueId ? data.reVerified : i)
          }));
        }
      }
    } catch (err) {
      console.error('Re-verification failed:', err);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* Header & Controls */}
      <Header
        targetUrl={targetUrl}
        setTargetUrl={setTargetUrl}
        isAuditing={isAuditing}
        onStartAudit={handleStartAudit}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Live Scan Console Ticker */}
      <LiveScanConsole scanProgress={scanProgress} isAuditing={isAuditing} />

      {/* Overview Metrics Cards */}
      <OverviewMetrics auditData={auditData} />

      {/* Primary Issue Matrix Table */}
      {auditData && (
        <IssueMatrix
          issues={auditData.issues || []}
          onSelectIssue={(issue) => setSelectedIssue(issue)}
        />
      )}

      {/* Regression History Timeline & Comparison */}
      <RegressionTimeline history={history} />

      {/* Issue Inspection Modal Drawer */}
      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onReverifyIssue={handleReverifyIssue}
      />

      {/* Report Download Exporter Modal */}
      <ReportExporter
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

    </div>
  );
}
