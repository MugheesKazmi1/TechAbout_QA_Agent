import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { collectPageEvidence } from './evidenceCollector.js';

/**
 * Autonomous QA Crawler for TechAbout.com
 * Explores site structure, navigation menus, CTAs, interactive components,
 * forms, and captures DOM & network anomalies.
 */
export async function crawlSite(startUrl = 'https://techabout.com', maxDepth = 2, maxPages = 15, onProgress = null) {
  const visited = new Set();
  const queue = [{ url: startUrl, depth: 0 }];
  const findings = [];
  const crawledPages = [];

  const originDomain = new URL(startUrl).hostname;

  if (onProgress) {
    onProgress({ stage: 'CRAWL_START', message: `Initializing Autonomous AI QA Agent on ${startUrl}...` });
  }

  while (queue.length > 0 && visited.size < maxPages) {
    const { url, depth } = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    if (onProgress) {
      onProgress({
        stage: 'CRAWL_PAGE',
        message: `Auditing [${visited.size}/${maxPages}] (${url})`,
        progress: Math.round((visited.size / maxPages) * 100),
        currentUrl: url
      });
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TechAbout-AI-QA-Agent/1.0 (Autonomous Auditor; Public Access Only)'
        },
        timeout: 10000
      });

      const statusCode = response.status;
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        findings.push({
          url,
          rawType: 'HTTP_ERROR',
          statusCode,
          message: `HTTP Server Error ${statusCode} on ${url}`,
          targetSelector: 'body',
          context: `Failed network request returning status code ${statusCode}`
        });
      }

      if (contentType.includes('text/html')) {
        const htmlText = await response.text();
        const dom = new JSDOM(htmlText, { url });
        const document = dom.window.document;

        // Extract Page Evidence & Issues
        const pageIssues = collectPageEvidence(url, document, statusCode, htmlText);
        findings.push(...pageIssues);

        crawledPages.push({
          url,
          title: document.title || 'Untitled Page',
          linksFound: document.querySelectorAll('a').length,
          imagesFound: document.querySelectorAll('img').length,
          formsFound: document.querySelectorAll('form').length,
          issuesCount: pageIssues.length
        });

        // Queue deeper links within target domain
        if (depth < maxDepth) {
          const links = document.querySelectorAll('a[href]');
          for (const link of links) {
            try {
              const href = link.getAttribute('href');
              if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;
              const fullUrl = new URL(href, url).href;

              // Stay within same domain and avoid non-http links
              const parsed = new URL(fullUrl);
              if (parsed.hostname === originDomain && (parsed.protocol === 'http:' || parsed.protocol === 'https:')) {
                // Strip trailing hash
                const cleanUrl = fullUrl.split('#')[0];
                if (!visited.has(cleanUrl) && !queue.some(q => q.url === cleanUrl)) {
                  queue.push({ url: cleanUrl, depth: depth + 1 });
                }
              }
            } catch (err) {
              // Invalid URL string ignored
            }
          }
        }
      }
    } catch (error) {
      findings.push({
        url,
        rawType: 'NETWORK_FAILURE',
        message: `Network connection failed or timed out: ${error.message}`,
        targetSelector: 'network',
        context: error.stack || error.message
      });
    }
  }

  if (onProgress) {
    onProgress({
      stage: 'CRAWL_COMPLETE',
      message: `Crawl completed! Discovered ${visited.size} pages and ${findings.length} raw observations.`,
      progress: 100
    });
  }

  return {
    pagesCrawled: crawledPages,
    rawFindings: findings,
    totalPages: visited.size
  };
}
