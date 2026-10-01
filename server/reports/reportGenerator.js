/**
 * Report Generator for TechAbout.com QA Audits
 */
export function generateMarkdownReport(auditRecord) {
  const { id, timestamp, targetUrl, pagesAudited, totalIssues, summary, issues, fixedIssues } = auditRecord;

  let md = `# Comprehensive AI QA Audit Report: ${targetUrl}\n\n`;
  md += `**Audit ID:** \`${id}\`  \n`;
  md += `**Timestamp:** ${new Date(timestamp).toLocaleString()}  \n`;
  md += `**Target Website:** [${targetUrl}](${targetUrl})  \n`;
  md += `**Pages & Journeys Audited:** ${pagesAudited}  \n`;
  md += `**Total Active Issues:** ${totalIssues}  \n\n`;

  md += `## 📊 Audit Executive Summary\n\n`;
  md += `| Metric | Count |\n| --- | --- |\n`;
  md += `| 🆕 New Discovered Issues | **${summary.new}** |\n`;
  md += `| ⚠️ Unresolved (Persistent) Issues | **${summary.unresolved}** |\n`;
  md += `| 🔄 Reappeared (Regression) Issues | **${summary.reappeared}** |\n`;
  md += `| ✅ Fixed Issues Since Last Audit | **${summary.fixed}** |\n\n`;

  md += `### Issues by Severity\n\n`;
  md += `- 🚨 **Critical:** ${summary.bySeverity.critical}\n`;
  md += `- 🔴 **High:** ${summary.bySeverity.high}\n`;
  md += `- 🟡 **Medium:** ${summary.bySeverity.medium}\n`;
  md += `- 🟢 **Low:** ${summary.bySeverity.low}\n\n`;

  md += `## 🐞 Detailed Findings & Reproduction Steps\n\n`;

  issues.forEach((issue, index) => {
    md += `### ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}\n\n`;
    md += `- **URL:** [${issue.url}](${issue.url})\n`;
    md += `- **Category:** \`${issue.category}\` | **Status:** \`${issue.status}\` | **Confidence:** \`${issue.reproducibility?.confidenceScore || '100%'}\`\n`;
    md += `- **Target Selector:** \`${issue.targetSelector}\`  \n\n`;

    md += `#### Steps to Reproduce:\n`;
    issue.stepsToReproduce.forEach((step, i) => {
      md += `${i + 1}. ${step}\n`;
    });

    md += `\n**Expected Behavior:**  \n${issue.expectedBehavior}\n\n`;
    md += `**Actual Behavior:**  \n${issue.actualBehavior}\n\n`;

    if (issue.suggestedFix) {
      md += `#### 💡 Suggested Fix & Remediation:\n${issue.suggestedFix}\n\n`;
    }

    md += `---\n\n`;
  });

  if (fixedIssues && fixedIssues.length > 0) {
    md += `## ✅ Resolved / Fixed Issues in This Audit\n\n`;
    fixedIssues.forEach(fixed => {
      md += `- **[${fixed.category}]** ${fixed.title} (*Resolved on ${fixed.url}*)\n`;
    });
  }

  return md;
}
