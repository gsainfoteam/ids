export function supportsPopover(node: HTMLElement) {
  return typeof node.showPopover === 'function';
}

export function showInTopLayer(node: HTMLElement) {
  if (!supportsPopover(node) || node.matches(':popover-open')) return;

  node.showPopover();
}

export function raiseInTopLayer(node: HTMLElement) {
  const doc = node.ownerDocument;
  const focusBeforeHiding = doc.activeElement as HTMLElement | null;

  if (supportsPopover(node) && node.matches(':popover-open')) node.hidePopover();
  showInTopLayer(node);

  if (
    focusBeforeHiding &&
    node.contains(focusBeforeHiding) &&
    doc.activeElement !== focusBeforeHiding
  )
    focusBeforeHiding.focus({ preventScroll: true });
}

export function withoutTransitions(node: HTMLElement, change: () => void) {
  const elements = [node, ...node.querySelectorAll<HTMLElement>('*')];
  const previous = elements.map((element) => element.style.transition);

  for (const element of elements) element.style.transition = 'none';
  try {
    change();
  } finally {
    const view = node.ownerDocument.defaultView;
    for (const element of elements) void view?.getComputedStyle(element).opacity;
    elements.forEach((element, index) => (element.style.transition = previous[index]!));
  }
}

const aboveEveryLayer = new Set<() => void>();

export function keepAboveLayers(raise: () => void) {
  aboveEveryLayer.add(raise);

  return () => {
    aboveEveryLayer.delete(raise);
  };
}

export function raiseWhatStaysAboveLayers() {
  for (const raise of aboveEveryLayer) raise();
}
