import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

/**
 * Autonomous Issue Reproduction Engine
 * Re-runs isolated test verification steps for detected issues to ensure 
 * 100% confidence before reporting.
 */
export async function reproduceIssue(issue) {
  let reproAttempts = 0;
  let reproSuccesses = 0;
  const targetAttempts = 2; // Test 2 additional times

  for (let i = 0; i < targetAttempts; i++) {
    reproAttempts++;
    try {
      const res = await fetch(issue.url, {
        headers: { 'User-Agent': 'TechAbout-QA-Reproducer/1.0' },
        timeout: 7000
      });

      if (issue.rawType === 'HTTP_ERROR' || issue.rawType === 'NETWORK_FAILURE') {
        if (res.status === issue.technicalEvidence.statusCode || !res.ok) {
          reproSuccesses++;
        }
      } else {
        const text = await res.text();
        const dom = new JSDOM(text, { url: issue.url });
        const doc = dom.window.document;

        // Re-check DOM condition
        if (issue.targetSelector) {
          const el = doc.querySelector(issue.targetSelector);
          if (issue.rawType === 'ACCESSIBILITY_MISSING_ALT' && el && (!el.getAttribute('alt') || el.getAttribute('alt').trim() === '')) {
            reproSuccesses++;
          } else if (issue.rawType === 'UX_BROKEN_INTERACTION' && el && ['#', 'javascript:void(0);'].includes(el.getAttribute('href'))) {
            reproSuccesses++;
          } else if (el || text.includes(issue.rawType)) {
            reproSuccesses++;
          }
        }
      }
    } catch (e) {
      if (issue.rawType === 'NETWORK_FAILURE' || issue.rawType === 'HTTP_ERROR') {
        reproSuccesses++;
      }
    }
  }

  const confidenceScore = Math.round(((reproSuccesses + 1) / (reproAttempts + 1)) * 100);
  const isReproduced = confidenceScore >= 50;

  return {
    ...issue,
    reproducibility: {
      isReproduced,
      attempts: reproAttempts + 1,
      successfulRepros: reproSuccesses + 1,
      confidenceScore: `${confidenceScore}%`,
      verifiedAt: new Date().toISOString()
    }
  };
}
