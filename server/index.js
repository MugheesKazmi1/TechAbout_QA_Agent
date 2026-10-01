import express from 'express';
import cors from 'cors';
import { crawlSite } from './agent/crawler.js';
import { classifyFinding } from './ai/classifier.js';
import { deduplicateIssues } from './ai/deduplicator.js';
import { reproduceIssue } from './ai/reproducer.js';
import { getAuditHistory, recordAuditRun } from './tracker/regressionTracker.js';
import { generateMarkdownReport } from './reports/reportGenerator.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Active audit streaming progress
let activeScanProgress = null;

// GET /api/audit/latest
app.get('/api/audit/latest', (req, res) => {
  const history = getAuditHistory();
  if (history.length === 0) {
    return res.status(404).json({ error: 'No audit history found.' });
  }
  res.json(history[history.length - 1]);
});

// GET /api/audit/history
app.get('/api/audit/history', (req, res) => {
  const history = getAuditHistory();
  res.json(history);
});

// GET /api/audit/progress
app.get('/api/audit/progress', (req, res) => {
  res.json(activeScanProgress || { stage: 'IDLE', message: 'Ready to start autonomous audit.' });
});

// POST /api/audit/start
app.post('/api/audit/start', async (req, res) => {
  const { url = 'https://techabout.com', depth = 2, maxPages = 15 } = req.body;

  try {
    activeScanProgress = { stage: 'INIT', message: `Initializing Autonomous AI Agent for ${url}...`, progress: 0 };

    // 1. Crawl & Discover
    const crawlResult = await crawlSite(url, depth, maxPages, (progressUpdate) => {
      activeScanProgress = progressUpdate;
    });

    // 2. Classify Findings via AI Engine
    activeScanProgress = { stage: 'AI_CLASSIFY', message: 'Running AI Issue Classification Engine...', progress: 80 };
    const rawClassified = crawlResult.rawFindings.map(classifyFinding);

    // 3. De-duplicate Issues
    activeScanProgress = { stage: 'DEDUPLICATE', message: 'De-duplicating issue signatures...', progress: 88 };
    const uniqueIssues = deduplicateIssues(rawClassified);

    // 4. Reproduce & Verify Findings
    activeScanProgress = { stage: 'REPRODUCE', message: 'Reproducing & verifying issue confidence...', progress: 94 };
    const verifiedIssues = await Promise.all(uniqueIssues.map(reproduceIssue));

    // 5. Track Regression against Historical Database
    activeScanProgress = { stage: 'REGRESSION_SYNC', message: 'Updating Regression History & State Machine...', progress: 98 };
    const auditRecord = recordAuditRun(verifiedIssues, {
      targetUrl: url,
      totalPages: crawlResult.totalPages
    });

    activeScanProgress = { stage: 'COMPLETE', message: 'Autonomous Audit Complete!', progress: 100 };

    res.json({
      success: true,
      auditRecord
    });
  } catch (error) {
    console.error('Audit execution error:', error);
    activeScanProgress = { stage: 'ERROR', message: `Audit failed: ${error.message}`, progress: 0 };
    res.status(500).json({ error: error.message });
  }
});

// POST /api/audit/reproduce/:issueId
app.post('/api/audit/reproduce/:issueId', async (req, res) => {
  const { issueId } = req.params;
  const history = getAuditHistory();
  if (history.length === 0) return res.status(404).json({ error: 'No audits found.' });

  const latestAudit = history[history.length - 1];
  const targetIssue = latestAudit.issues.find(i => i.id === issueId);

  if (!targetIssue) {
    return res.status(404).json({ error: 'Issue ID not found in latest audit.' });
  }

  const reVerified = await reproduceIssue(targetIssue);
  res.json({ success: true, reVerified });
});

// GET /api/audit/export
app.get('/api/audit/export', (req, res) => {
  const history = getAuditHistory();
  if (history.length === 0) return res.status(404).send('No audit report found.');
  const latestAudit = history[history.length - 1];

  const format = req.query.format || 'markdown';

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="TechAbout_QA_Audit_${latestAudit.id}.json"`);
    return res.send(JSON.stringify(latestAudit, null, 2));
  }

  const markdownContent = generateMarkdownReport(latestAudit);

  if (format === 'markdown') {
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="TechAbout_QA_Audit_${latestAudit.id}.md"`);
    return res.send(markdownContent);
  }

  // HTML format fallback
  const htmlDoc = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>TechAbout.com QA Audit Report</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 20px; background: #f8fafc; }
      h1, h2, h3 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; }
      th, td { padding: 12px 16px; border: 1px solid #e2e8f0; text-align: left; }
      th { background: #0f172a; color: white; }
      pre { background: #0f172a; color: #38bdf8; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
      .badge-critical { background: #fee2e2; color: #991b1b; }
      .badge-high { background: #ffedd5; color: #9a3412; }
      .badge-medium { background: #fef9c3; color: #854d0e; }
      .badge-low { background: #dcfce7; color: #166534; }
    </style>
  </head>
  <body>
    <div>
      <pre>${markdownContent}</pre>
    </div>
  </body>
  </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `attachment; filename="TechAbout_QA_Audit_${latestAudit.id}.html"`);
  res.send(htmlDoc);
});

app.listen(PORT, () => {
  console.log(`AI QA Agent API Server running at http://localhost:${PORT}`);
});
