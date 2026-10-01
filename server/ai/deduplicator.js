/**
 * Removes duplicate issues across audited pages by calculating
 * a normalized issue signature/fingerprint.
 */
export function deduplicateIssues(classifiedIssues) {
  const seenSignatures = new Map();
  const uniqueIssues = [];

  for (const issue of classifiedIssues) {
    try {
      const urlObj = new URL(issue.url);
      // Normalize path (strip query params and trailing slash for deduplication)
      const normalizedPath = urlObj.pathname.replace(/\/$/, '') || '/';
      
      // Signature key combination
      const signature = `${issue.category}:${issue.rawType}:${issue.targetSelector}:${normalizedPath}`;

      if (!seenSignatures.has(signature)) {
        seenSignatures.set(signature, issue);
        uniqueIssues.push(issue);
      } else {
        // Increment occurrence count metadata
        const existing = seenSignatures.get(signature);
        if (!existing.occurrences) existing.occurrences = 1;
        existing.occurrences += 1;
      }
    } catch (err) {
      // Fallback if URL parsing fails
      uniqueIssues.push(issue);
    }
  }

  return uniqueIssues;
}
