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

function measureFitWidth(root: HTMLElement) {
  const style = getComputedStyle(root);
  const edges = contentEdges(root, style);
  const longest = longestLine(root, edges, style.direction === 'rtl');
  const wrappedShorterThanTheBox =
    longest > 0 && edges.end - edges.start - longest >= SUBPIXEL_SLACK;
  if (!wrappedShorterThanTheBox) return null;

  const frame = root.getBoundingClientRect().width - (edges.end - edges.start);
  return `${Math.ceil(frame + longest)}px`;
}

const mounted = new Set<HTMLElement>();
const pending = new Set<HTMLElement>();
let flushQueued = false;

function flushInOneLayout() {
  flushQueued = false;
  const roots = [...pending].filter((root) => root.isConnected);
  pending.clear();

  for (const root of roots) root.style.removeProperty(FIT_WIDTH_PROPERTY);
  const widths = roots.map(measureFitWidth);
  roots.forEach((root, index) => {
    const width = widths[index];
    if (width) root.style.setProperty(FIT_WIDTH_PROPERTY, width);
  });
}

function scheduleFit(root: HTMLElement) {
  pending.add(root);
  if (flushQueued) return;
  flushQueued = true;
  queueMicrotask(flushInOneLayout);
}

const parentWidths = new Map<Element, number | undefined>();
const bubblesByParent = new Map<Element, Set<HTMLElement>>();
let parentResize: ResizeObserver | null = null;

function refitWhenParentWidthChanges(entries: ResizeObserverEntry[]) {
  for (const { target, contentRect } of entries) {
    const previous = parentWidths.get(target);
    parentWidths.set(target, contentRect.width);
    if (previous === contentRect.width) continue;
    bubblesByParent.get(target)?.forEach(scheduleFit);
  }
}

function refitEveryBubble() {
  mounted.forEach(scheduleFit);
}

function watchParent(root: HTMLElement, parent: Element) {
  parentResize ??= new ResizeObserver(refitWhenParentWidthChanges);
  const siblings = bubblesByParent.get(parent);
  if (siblings) {
    siblings.add(root);
    return;
  }
  bubblesByParent.set(parent, new Set([root]));
  parentWidths.set(parent, undefined);
  parentResize.observe(parent);
}

function unwatchParent(root: HTMLElement, parent: Element) {
  const siblings = bubblesByParent.get(parent);
  siblings?.delete(root);
  if (siblings?.size) return;
  bubblesByParent.delete(parent);
  parentWidths.delete(parent);
  parentResize?.unobserve(parent);
}

export function fitToLongestLine(root: HTMLElement | null) {
  if (!root) return;

  if (mounted.size === 0) document.fonts.addEventListener('loadingdone', refitEveryBubble);
  mounted.add(root);
  scheduleFit(root);

  const parent = root.parentElement;
  if (parent) watchParent(root, parent);

  const mutation = new MutationObserver(() => scheduleFit(root));
  mutation.observe(root, { childList: true, characterData: true, subtree: true });

  return () => {
    mutation.disconnect();
    if (parent) unwatchParent(root, parent);
    mounted.delete(root);
    pending.delete(root);
    if (mounted.size === 0) document.fonts.removeEventListener('loadingdone', refitEveryBubble);
    root.style.removeProperty(FIT_WIDTH_PROPERTY);
  };
}
