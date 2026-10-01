/**
 * Collects evidence from DOM, head metadata, images, interactive elements, forms, and inline scripts.
 */
export function collectPageEvidence(url, document, statusCode, htmlText) {
  const issues = [];

  // 1. Check Title & SEO Meta Tags
  const titleEl = document.querySelector('title');
  if (!titleEl || !titleEl.textContent.trim()) {
    issues.push({
      url,
      rawType: 'SEO_MISSING_TITLE',
      message: 'Page is missing a `<title>` tag or title text is empty.',
      targetSelector: 'head > title',
      context: 'Title tags are crucial for search engine indexing and user navigation accessibility.'
    });
  }

  const metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc || !metaDesc.getAttribute('content')?.trim()) {
    issues.push({
      url,
      rawType: 'SEO_MISSING_META_DESC',
      message: 'Meta description tag is missing or empty.',
      targetSelector: 'head > meta[name="description"]',
      context: 'Missing meta description impairs search engine snippet optimization.'
    });
  }

  // 2. Check Heading Hierarchy (Only 1 h1 per page)
  const h1s = document.querySelectorAll('h1');
  if (h1s.length === 0) {
    issues.push({
      url,
      rawType: 'SEO_ACCESSIBILITY_H1',
      message: 'No `<h1>` heading found on the page.',
      targetSelector: 'body',
      context: 'Semantic HTML requires a primary <h1> heading for proper screen reader hierarchy.'
    });
  } else if (h1s.length > 1) {
    issues.push({
      url,
      rawType: 'SEO_ACCESSIBILITY_H1_MULTIPLE',
      message: `Multiple (${h1s.length}) \`<h1>\` headings detected on single page.`,
      targetSelector: 'h1',
      context: 'Having multiple <h1> elements weakens SEO keyword targeting and confuses assistive readers.'
    });
  }

  // 3. Images accessibility (Missing alt text & broken src)
  const images = document.querySelectorAll('img');
  images.forEach((img, idx) => {
    const src = img.getAttribute('src');
    const alt = img.getAttribute('alt');

    if (alt === null || alt.trim() === '') {
      issues.push({
        url,
        rawType: 'ACCESSIBILITY_MISSING_ALT',
        message: `Image element missing decorative/informative \`alt\` text attribute.`,
        targetSelector: `img:nth-of-type(${idx + 1})[src="${src || ''}"]`,
        context: `<img src="${src || 'unknown'}"> has no alt attribute.`
      });
    }

    if (!src || src.trim() === '' || src === '#') {
      issues.push({
        url,
        rawType: 'BROKEN_IMAGE_SRC',
        message: 'Image element has empty or invalid `src` attribute.',
        targetSelector: `img:nth-of-type(${idx + 1})`,
        context: 'Empty image source causes unnecessary 404 network fetch attempts.'
      });
    }
  });

  // 4. Broken or Empty Anchor Links
  const links = document.querySelectorAll('a');
  links.forEach((a, idx) => {
    const href = a.getAttribute('href');
    const text = a.textContent.trim();

    if (!href || href === '#' || href === 'javascript:void(0);' || href === 'javascript:;') {
      if (text) {
        issues.push({
          url,
          rawType: 'UX_BROKEN_INTERACTION',
          message: `Clickable link "${text.substring(0, 30)}" has placeholder or missing \`href\` attribute.`,
          targetSelector: `a:nth-of-type(${idx + 1})`,
          context: `Link text: "${text}" with href="${href}"`
        });
      }
    }

    // Generic link text (UX issue)
    if (['click here', 'read more', 'here', 'more'].includes(text.toLowerCase())) {
      issues.push({
        url,
        rawType: 'UX_GENERIC_LINK_TEXT',
        message: `Generic non-descriptive link text "${text}" detected.`,
        targetSelector: `a[href="${href}"]`,
        context: 'Links should have descriptive text for accessibility screen readers and UX clarity.'
      });
    }
  });

  // 5. Form validation & CTAs
  const forms = document.querySelectorAll('form');
  forms.forEach((form, idx) => {
    const action = form.getAttribute('action');
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');

    if (!action && !form.getAttribute('onsubmit')) {
      issues.push({
        url,
        rawType: 'FUNCTIONALITY_FORM_NO_ACTION',
        message: `Form element #${idx + 1} has no \`action\` URL or submit handler specified.`,
        targetSelector: `form:nth-of-type(${idx + 1})`,
        context: 'Submitting this form may result in page reload or broken user input submission.'
      });
    }

    if (!submitBtn) {
      issues.push({
        url,
        rawType: 'UI_UX_FORM_NO_SUBMIT',
        message: `Form element #${idx + 1} is missing an explicit submit button.`,
        targetSelector: `form:nth-of-type(${idx + 1})`,
        context: 'Users cannot submit form via mouse click without a submit control.'
      });
    }

    // Check input fields missing labels
    const inputs = form.querySelectorAll('input:not([type="hidden"]):not([type="submit"])');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const name = input.getAttribute('name') || input.getAttribute('placeholder') || 'input';
      const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : false;
      const ariaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');

      if (!hasLabel && !ariaLabel && !input.getAttribute('placeholder')) {
        issues.push({
          url,
          rawType: 'ACCESSIBILITY_INPUT_NO_LABEL',
          message: `Form input field (${name}) lacks an associated \`<label>\` or \`aria-label\`.`,
          targetSelector: input.tagName.toLowerCase() + (id ? `#${id}` : `[name="${name}"]`),
          context: 'Unlabeled form controls impede assistive screen reader users.'
        });
      }
    });
  });

  // 6. Embedded Scripts & CSS errors
  if (htmlText.includes('console.error') || htmlText.includes('Uncaught Error') || htmlText.includes('ReferenceError')) {
    issues.push({
      url,
      rawType: 'TECHNICAL_INLINE_JS_ERROR',
      message: 'Detected inline script error signature or unhandled error trace in page HTML content.',
      targetSelector: 'script',
      context: 'Inline runtime exceptions can break dynamic navigation menus and interactive components.'
    });
  }

  // 7. Security / External Links missing rel="noopener"
  const externalLinks = document.querySelectorAll('a[target="_blank"]');
  externalLinks.forEach(link => {
    const rel = link.getAttribute('rel') || '';
    if (!rel.includes('noopener') && !rel.includes('noreferrer')) {
      issues.push({
        url,
        rawType: 'TECHNICAL_SECURITY_TARGET_BLANK',
        message: 'External link opening in `target="_blank"` lacks `rel="noopener noreferrer"`.',
        targetSelector: `a[href="${link.getAttribute('href')}"]`,
        context: 'Missing noopener allows target page to access window.opener, introducing tabnabbing vulnerability.'
      });
    }
  });

  return issues;
}
