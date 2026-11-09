export const FIT_WIDTH_PROPERTY = '--bubble-fit-width';

const REPLACED_ELEMENTS = new Set([
  'canvas',
  'embed',
  'iframe',
  'img',
  'input',
  'object',
  'picture',
  'select',
  'svg',
  'textarea',
  'video',
]);

const SUBPIXEL_SLACK = 1;

type Edges = { start: number; end: number };

function isOutOfFlow(style: CSSStyleDeclaration) {
  return style.position === 'absolute' || style.position === 'fixed';
}

function isAtomicInline(element: Element, style: CSSStyleDeclaration) {
  return (
    REPLACED_ELEMENTS.has(element.localName) ||
    style.display.startsWith('inline-') ||
    style.display === 'inline flow-root'
  );
}

function contentEdges(root: HTMLElement, style: CSSStyleDeclaration): Edges {
  const rect = root.getBoundingClientRect();
  return {
    start: rect.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft),
    end: rect.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight),
  };
}

function longestLine(root: HTMLElement, edges: Edges, rtl: boolean) {
  const range = document.createRange();
  let longest = 0;

  const reach = (rect: DOMRect) => {
    if (rect.width === 0) return;
    longest = Math.max(longest, rtl ? edges.end - rect.left : rect.right - edges.start);
  };

  const visit = (node: Node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        range.selectNodeContents(child);
        for (const rect of range.getClientRects()) reach(rect);
        continue;
      }
      if (!(child instanceof Element)) continue;
      const style = getComputedStyle(child);
      if (style.display === 'none' || isOutOfFlow(style)) continue;
      if (isAtomicInline(child, style)) reach(child.getBoundingClientRect());
      else visit(child);
    }
  };

  visit(root);
  return longest;
}

function fit(root: HTMLElement) {
  root.style.removeProperty(FIT_WIDTH_PROPERTY);

  const style = getComputedStyle(root);
  const edges = contentEdges(root, style);
  const longest = longestLine(root, edges, style.direction === 'rtl');
  const wrappedShorterThanTheBox =
    longest > 0 && edges.end - edges.start - longest >= SUBPIXEL_SLACK;
  if (!wrappedShorterThanTheBox) return;

  const frame = root.getBoundingClientRect().width - (edges.end - edges.start);
  root.style.setProperty(FIT_WIDTH_PROPERTY, `${Math.ceil(frame + longest)}px`);
}

export function fitToLongestLine(root: HTMLElement | null) {
  if (!root) return;

  fit(root);

  const parent = root.parentElement;
  let parentWidth = parent?.clientWidth;
  const resize = new ResizeObserver(() => {
    if (parent?.clientWidth === parentWidth) return;
    parentWidth = parent?.clientWidth;
    fit(root);
  });
  if (parent) resize.observe(parent);

  const mutation = new MutationObserver(() => fit(root));
  mutation.observe(root, { childList: true, characterData: true, subtree: true });

  const refit = () => fit(root);
  document.fonts.addEventListener('loadingdone', refit);

  return () => {
    resize.disconnect();
    mutation.disconnect();
    document.fonts.removeEventListener('loadingdone', refit);
    root.style.removeProperty(FIT_WIDTH_PROPERTY);
  };
}
