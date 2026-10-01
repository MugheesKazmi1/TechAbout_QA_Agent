import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'audit_history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Load all past audit records from disk
 */
export function getAuditHistory() {
  if (!fs.existsSync(HISTORY_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read audit history:', err);
    return [];
  }
}

/**
 * Save new audit run and calculate Regression States:
 * - NEW: First time discovered
 * - UNRESOLVED: Persists from previous run
 * - FIXED: Disappeared in current audit
 * - REAPPEARED: Disappeared previously but came back in this audit
 */
export function recordAuditRun(currentIssues, auditMetadata) {
  const history = getAuditHistory();
  const previousAudit = history.length > 0 ? history[history.length - 1] : null;
  const allPastAudits = history;

  // Build key mapping helper
  const makeKey = (iss) => `${iss.category}:${iss.rawType}:${iss.targetSelector}:${new URL(iss.url).pathname}`;

  const currentMap = new Map();
  const processedCurrentIssues = [];

  for (const issue of currentIssues) {
    const key = makeKey(issue);
    currentMap.set(key, issue);

    let status = 'NEW';

    if (previousAudit) {
      const foundInPrevious = previousAudit.issues.find(p => makeKey(p) === key);
      
      if (foundInPrevious) {
        status = 'UNRESOLVED';
      } else {
        // Check if it appeared in ANY older audit before previous audit (was fixed, now reappeared)
        let appearedInOlderFixed = false;
        for (const past of allPastAudits) {
          if (past.fixedIssues && past.fixedIssues.some(f => makeKey(f) === key)) {
            appearedInOlderFixed = true;
            break;
          }
        }
        if (appearedInOlderFixed) {
          status = 'REAPPEARED';
        }
      }
    }

    processedCurrentIssues.push({
      ...issue,
      status
    });
  }

  // Find Fixed issues (present in previous audit, but missing in current audit)
  const fixedIssues = [];
  if (previousAudit) {
    for (const prevIssue of previousAudit.issues) {
      const prevKey = makeKey(prevIssue);
      if (!currentMap.has(prevKey) && prevIssue.status !== 'FIXED') {
        fixedIssues.push({
          ...prevIssue,
          status: 'FIXED',
          resolvedAt: new Date().toISOString()
        });
      }
    }
  }

  const newCount = processedCurrentIssues.filter(i => i.status === 'NEW').length;
  const unresolvedCount = processedCurrentIssues.filter(i => i.status === 'UNRESOLVED').length;
  const reappearedCount = processedCurrentIssues.filter(i => i.status === 'REAPPEARED').length;
  const fixedCount = fixedIssues.length;

  const auditRecord = {
    id: `AUDIT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    targetUrl: auditMetadata.targetUrl || 'https://techabout.com',
    pagesAudited: auditMetadata.totalPages || 0,
    totalIssues: processedCurrentIssues.length,
    summary: {
      new: newCount,
      unresolved: unresolvedCount,
      reappeared: reappearedCount,
      fixed: fixedCount,
      bySeverity: {
        critical: processedCurrentIssues.filter(i => i.severity === 'Critical').length,
        high: processedCurrentIssues.filter(i => i.severity === 'High').length,
        medium: processedCurrentIssues.filter(i => i.severity === 'Medium').length,
        low: processedCurrentIssues.filter(i => i.severity === 'Low').length
      },
      byCategory: {
        Functionality: processedCurrentIssues.filter(i => i.category === 'Functionality').length,
        UI_UX: processedCurrentIssues.filter(i => i.category === 'UI/UX').length,
        Performance: processedCurrentIssues.filter(i => i.category === 'Performance').length,
        Accessibility: processedCurrentIssues.filter(i => i.category === 'Accessibility').length,
        SEO: processedCurrentIssues.filter(i => i.category === 'SEO').length,
        Technical: processedCurrentIssues.filter(i => i.category === 'Technical').length
      }
    },
    issues: processedCurrentIssues,
    fixedIssues
  };

  history.push(auditRecord);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');

  return auditRecord;
}
