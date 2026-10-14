import sanitizeHtml from 'sanitize-html';

/** Images must come from the site's own media library (no third-party trackers). */
const ALLOWED_IMG_SRC = /^(\/backend\/media\/|\/media\/)[a-f0-9]{32}\.webp$/;

/**
 * Rich-text sanitiser for WYSIWYG content. Only a conservative set of formatting tags is kept;
 * scripts, event handlers, inline styles, iframes and javascript: URLs are always removed.
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h2',
      'h3',
      'h4',
      'p',
      'br',
      'hr',
      'strong',
      'em',
      'u',
      's',
      'code',
      'pre',
      'blockquote',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'figure',
      'figcaption',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      code: ['class'],
      pre: ['class'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowedClasses: { code: [/^language-[\w-]+$/], pre: [/^language-[\w-]+$/] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href ?? '');
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(external
              ? { target: '_blank', rel: 'noopener noreferrer nofollow' }
              : {}),
          },
        };
      },
    },
    exclusiveFilter: (frame) =>
      frame.tag === 'img' && !ALLOWED_IMG_SRC.test(frame.attribs.src ?? ''),
  });
}

/**
 * Plain text for single-line fields: strips any markup, then restores the characters the
 * sanitiser entity-encoded so the stored value is real text ("a < b", not "a &lt; b").
 * The value is plain text: it must always be escaped on output (React and the mail templates do).
 */
export function plain(value: string): string {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}
