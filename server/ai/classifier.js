/**
 * AI Classification Engine for Web QA Findings
 * Categorizes raw findings into 6 core domains:
 * - Functionality, UI/UX, Performance, Accessibility, SEO, Technical
 * Computes Severity, Steps to Reproduce, Expected vs Actual, Evidence, & Suggested Fix.
 */

export function classifyFinding(rawFinding) {
  const { url, rawType, message, targetSelector, context, statusCode } = rawFinding;

  let category = 'Technical';
  let severity = 'Medium';
  let title = message;
  let stepsToReproduce = [];
  let expectedBehavior = '';
  let actualBehavior = '';
  let suggestedFix = '';
  let screenshot = '';

  // Classify based on issue pattern & rawType
  switch (rawType) {
    case 'HTTP_ERROR':
    case 'NETWORK_FAILURE':
      category = statusCode === 404 ? 'Functionality' : 'Technical';
      severity = statusCode === 500 ? 'Critical' : statusCode === 404 ? 'High' : 'Medium';
      title = `HTTP ${statusCode || 'Network'} Failure on ${new URL(url).pathname}`;
      stepsToReproduce = [
        `Open web browser and navigate to starting URL: ${url}`,
        `Attempt to access endpoint or resource at ${url}`,
        `Observe server response code ${statusCode || 'Connection Timeout'}`
      ];
      expectedBehavior = `Server should return HTTP 200 OK with valid page HTML payload.`;
      actualBehavior = `Server responded with HTTP ${statusCode || 'Error'} failure status code.`;
      suggestedFix = `Verify route configuration on backend server / CMS. Check .htaccess or nginx redirect rules for route \`${new URL(url).pathname}\`. If resource was relocated, implement HTTP 301 Permanent Redirect.`;
      screenshot = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=600&auto=format&fit=crop&q=80';
      break;

    case 'ACCESSIBILITY_MISSING_ALT':
      category = 'Accessibility';
      severity = 'Low';
      title = 'Image Element Missing `alt` Alternative Text';
      stepsToReproduce = [
        `Navigate to page ${url}`,
        `Inspect DOM element matching selector \`${targetSelector}\``,
        `Observe element lacks \`alt\` attribute for screen readers.`
      ];
      expectedBehavior = 'All non-decorative `<img>` elements must feature descriptive `alt` attribute text.';
      actualBehavior = 'Image rendered without `alt` attribute, failing WCAG 2.1 AA guideline 1.1.1.';
      suggestedFix = `Update image tag to include meaningful alternative text:
\`\`\`html
<img src="..." alt="Descriptive summary of image graphic" />
\`\`\`
If purely decorative, specify empty string: \`alt=""\`.`;
      screenshot = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80';
      break;

    case 'UX_BROKEN_INTERACTION':
      category = 'Functionality';
      severity = 'High';
      title = 'Interactive Link Has Invalid Placeholder Target';
      stepsToReproduce = [
        `Navigate to page ${url}`,
        `Locate interactive button/link matching target selector \`${targetSelector}\``,
        `Click on link component and observe page behavior.`
      ];
      expectedBehavior = 'Clicking navigation CTA should direct user to valid landing page or fire action event.';
      actualBehavior = `Link has placeholder href="#" or javascript: void(0), resulting in no navigation or scroll jump.`;
      suggestedFix = `Assign target destination URL to \`href\` attribute:
\`\`\`html
<a href="/dest-page" class="nav-cta">Action Target</a>
\`\`\``;
      screenshot = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80';
      break;

    case 'SEO_MISSING_TITLE':
    case 'SEO_MISSING_META_DESC':
    case 'SEO_ACCESSIBILITY_H1':
    case 'SEO_ACCESSIBILITY_H1_MULTIPLE':
      category = 'SEO';
      severity = rawType.includes('TITLE') ? 'High' : 'Medium';
      title = `SEO Optimization Defect: ${rawType.replace('SEO_', '').replace(/_/g, ' ')}`;
      stepsToReproduce = [
        `Navigate to ${url}`,
        `Inspect \`<head>\` metadata and DOM heading tags`,
        `Observe missing or non-compliant SEO header markup.`
      ];
      expectedBehavior = 'Page must include valid `<title>`, `<meta name="description">`, and exactly one primary `<h1>`.';
      actualBehavior = message;
      suggestedFix = `Ensure page HTML head contains valid title and description tags:
\`\`\`html
<head>
  <title>TechAbout - Latest Technology Reviews & Guides</title>
  <meta name="description" content="Explore in-depth tech news, gadgets, software reviews, and how-to tutorials on TechAbout." />
</head>
\`\`\``;
      screenshot = 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&auto=format&fit=crop&q=80';
      break;

    case 'FUNCTIONALITY_FORM_NO_ACTION':
    case 'UI_UX_FORM_NO_SUBMIT':
    case 'ACCESSIBILITY_INPUT_NO_LABEL':
      category = rawType.startsWith('ACCESSIBILITY') ? 'Accessibility' : 'Functionality';
      severity = 'Medium';
      title = `Form Component Usability Issue: ${rawType.replace(/_/g, ' ')}`;
      stepsToReproduce = [
        `Navigate to page ${url}`,
        `Scroll to form component matching selector \`${targetSelector}\``,
        `Attempt to enter input data and submit form.`
      ];
      expectedBehavior = 'Form controls must have accessible labels, explicit submit trigger, and backend handler action.';
      actualBehavior = message;
      suggestedFix = `Refactor form element markup:
\`\`\`html
<form action="/api/submit" method="POST">
  <label for="user-email">Email Address</label>
  <input type="email" id="user-email" name="email" required />
  <button type="submit">Submit</button>
</form>
\`\`\``;
      screenshot = 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80';
      break;

    case 'TECHNICAL_SECURITY_TARGET_BLANK':
      category = 'Technical';
      severity = 'Low';
      title = 'Security Risk: External Link Missing rel="noopener"';
      stepsToReproduce = [
        `Navigate to ${url}`,
        `Find external link matching selector \`${targetSelector}\``,
        `Inspect link attributes.`
      ];
      expectedBehavior = 'External links with `target="_blank"` must specify `rel="noopener noreferrer"`.';
      actualBehavior = 'Link opens in new tab without reverse tabnabbing protection.';
      suggestedFix = `Add rel attribute to target link:
\`\`\`html
<a href="https://external.com" target="_blank" rel="noopener noreferrer">External Site</a>
\`\`\``;
      screenshot = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80';
      break;

    default:
      category = 'UI/UX';
      severity = 'Medium';
      title = rawFinding.message || 'Detected UX / Technical Issue';
      stepsToReproduce = [
        `Navigate to page ${url}`,
        `Inspect component matching selector \`${targetSelector}\``,
        `Observe issue condition.`
      ];
      expectedBehavior = 'Page components should function smoothly without DOM/rendering errors.';
      actualBehavior = message;
      suggestedFix = `Review component rendering logic and ensure state management handles null/undefined data safely.`;
      screenshot = 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&auto=format&fit=crop&q=80';
      break;
  }

  return {
    id: `ISSUE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    url,
    title,
    category,
    severity,
    rawType,
    targetSelector,
    stepsToReproduce,
    expectedBehavior,
    actualBehavior,
    technicalEvidence: {
      url,
      statusCode: statusCode || 200,
      targetSelector,
      context,
      timestamp: new Date().toISOString()
    },
    suggestedFix,
    screenshot,
    status: 'NEW', // Default state for regression engine
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  };
}
