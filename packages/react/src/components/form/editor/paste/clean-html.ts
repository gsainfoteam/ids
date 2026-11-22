const WORD_SOURCE = /urn:schemas-microsoft-com|class="?Mso|mso-/i;
const WORD_LIST_ITEM = /mso-list:\s*l\d+\s+level(\d+)/i;
const WORD_LIST_MARKER = 'span[style*="mso-list:Ignore" i]';
const ORDERED_MARKER = /^[\da-z]{1,4}[.)]$/i;
const GOOGLE_DOCS_WRAPPER = 'b[id^="docs-internal-guid"]';
const BLANK = /\s/g;

type OpenList = { list: HTMLElement; ordered: boolean; lastItem: HTMLElement | null };

const copiedFromProseMirror = (html: string) => html.includes('data-pm-slice');

const unwrap = (element: Element) => element.replaceWith(...element.childNodes);

const isBlank = (element: Element) =>
  element.textContent.replace(BLANK, '') === '' && !element.querySelector('img, br, hr');

function removeComments(root: Node) {
  const walker = root.ownerDocument!.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const comments: Node[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  for (const comment of comments) comment.parentNode?.removeChild(comment);
}

const wordListLevelOf = (paragraph: Element) =>
  Number(WORD_LIST_ITEM.exec(paragraph.getAttribute('style') ?? '')?.[1] ?? 0);

function takeWordListMarker(paragraph: Element) {
  const marker = paragraph.querySelector(WORD_LIST_MARKER);
  const text = marker?.textContent.replace(BLANK, '') ?? '';
  marker?.remove();
  return { ordered: ORDERED_MARKER.test(text) };
}

function openList(document: Document, ordered: boolean): OpenList {
  return { list: document.createElement(ordered ? 'ol' : 'ul'), ordered, lastItem: null };
}

function placeNestedList(open: OpenList[], nested: OpenList, before: Element) {
  const parent = open.at(-1);
  if (!parent) {
    before.before(nested.list);
    return;
  }
  if (!parent.lastItem) {
    parent.lastItem = before.ownerDocument.createElement('li');
    parent.list.append(parent.lastItem);
  }
  parent.lastItem.append(nested.list);
}

function turnWordListParagraphsIntoLists(body: HTMLElement) {
  let open: OpenList[] = [];
  let previous: Element | null = null;

  for (const paragraph of Array.from(body.querySelectorAll('p'))) {
    const level = wordListLevelOf(paragraph);
    if (level === 0) continue;
    if (paragraph.previousElementSibling !== previous) open = [];

    const { ordered } = takeWordListMarker(paragraph);
    while (open.length > level || (open.length === level && open.at(-1)!.ordered !== ordered)) {
      open.pop();
    }
    while (open.length < level) {
      const nested = openList(paragraph.ownerDocument, ordered);
      placeNestedList(open, nested, paragraph);
      open.push(nested);
    }

    const item = paragraph.ownerDocument.createElement('li');
    item.append(...paragraph.childNodes);
    const current = open.at(-1)!;
    current.list.append(item);
    current.lastItem = item;

    previous = paragraph.previousElementSibling;
    paragraph.remove();
  }
}

function cleanWordHtml(body: HTMLElement) {
  removeComments(body);
  turnWordListParagraphsIntoLists(body);
  for (const officeMark of Array.from(body.getElementsByTagName('o:p'))) officeMark.remove();
  for (const paragraph of Array.from(body.querySelectorAll('p'))) {
    if (isBlank(paragraph)) paragraph.remove();
  }
}

function cleanGoogleDocsHtml(body: HTMLElement) {
  body.querySelectorAll(GOOGLE_DOCS_WRAPPER).forEach(unwrap);
  for (const lineBreak of Array.from(body.children)) {
    if (lineBreak.localName === 'br') lineBreak.remove();
  }
}

export function cleanPastedHtml(html: string) {
  if (copiedFromProseMirror(html)) return html;

  const { body } = new DOMParser().parseFromString(html, 'text/html');
  if (WORD_SOURCE.test(html)) cleanWordHtml(body);
  if (body.querySelector(GOOGLE_DOCS_WRAPPER)) cleanGoogleDocsHtml(body);
  return body.innerHTML;
}
