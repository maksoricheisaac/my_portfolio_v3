import { plain, sanitizeRichText } from './sanitize';

describe('sanitizeRichText', () => {
  it('keeps conservative formatting', () => {
    const html =
      '<h2>Titre</h2><p>Un <strong>texte</strong> <em>riche</em></p><ul><li>a</li></ul>';
    expect(sanitizeRichText(html)).toBe(html);
  });

  it('removes scripts, event handlers and javascript: links', () => {
    const out = sanitizeRichText(
      '<p onclick="x()">a<script>alert(1)</script><a href="javascript:alert(1)">l</a></p>',
    );
    expect(out).not.toMatch(/script|onclick|javascript:/i);
  });

  it('only allows images served by the media route', () => {
    expect(sanitizeRichText('<img src="http://evil/x.png">')).toBe('');
    expect(sanitizeRichText('<img src="data:image/svg+xml;base64,AAA">')).toBe(
      '',
    );
    expect(
      sanitizeRichText(
        '<img src="/backend/media/' + 'a'.repeat(32) + '.webp" alt="ok">',
      ),
    ).toContain('<img');
  });

  it('hardens external links', () => {
    const out = sanitizeRichText('<a href="https://example.com">x</a>');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
    expect(out).toContain('target="_blank"');
  });
});

describe('plain', () => {
  it('strips markup', () => {
    expect(plain('<b>Hi</b> <script>x</script>there')).toBe('Hi there');
  });
});

describe('hardening', () => {
  it('refuses third-party images and path tricks', () => {
    expect(sanitizeRichText('<img src="https://t.example/p.png">')).toBe('');
    expect(sanitizeRichText('<img src="/backend/media/../../x">')).toBe('');
    expect(sanitizeRichText('<img src="//evil.example/x.png">')).toBe('');
  });

  it('plain() returns real text, not entities', () => {
    expect(plain('a < b & c')).toBe('a < b & c');
    expect(plain('<img src=x onerror=alert(1)>ok')).toBe('ok');
  });
});
