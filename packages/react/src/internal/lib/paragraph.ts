const CLOSES_A_PARAGRAPH = [
  'address',
  'article',
  'aside',
  'blockquote',
  'details',
  'dialog',
  'div',
  'dl',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'main',
  'menu',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'ul',
].join(',');

export function blockInsideParagraph(paragraph: Element | null) {
  if (paragraph?.localName !== 'p') return null;
  return paragraph.querySelector(CLOSES_A_PARAGRAPH);
}
