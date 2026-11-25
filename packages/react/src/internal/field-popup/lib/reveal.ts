const firstPlacementLanded = new WeakSet<HTMLElement>();
const recenterAfterFirstPlacement = new WeakMap<HTMLElement, HTMLElement>();

export function onPlacementLanded(node: HTMLElement) {
  firstPlacementLanded.add(node);

  const option = recenterAfterFirstPlacement.get(node);
  if (!option) return;

  recenterAfterFirstPlacement.delete(node);
  if (node.contains(option)) scrollWithinPopup(option, node, true);
}

function scrollParent(option: HTMLElement, popup: HTMLElement) {
  const view = popup.ownerDocument.defaultView;

  for (let node = option.parentElement; node && node !== popup; node = node.parentElement) {
    const overflow = view?.getComputedStyle(node).overflowY;
    if (overflow === 'auto' || overflow === 'scroll') return node;
  }

  return popup;
}

function scrollPaddingOf(scroller: HTMLElement) {
  const style = scroller.ownerDocument.defaultView!.getComputedStyle(scroller);
  return {
    top: parseFloat(style.scrollPaddingTop) || 0,
    bottom: parseFloat(style.scrollPaddingBottom) || 0,
  };
}

function scrollWithinPopup(option: HTMLElement, popup: HTMLElement, center: boolean) {
  const scroller = scrollParent(option, popup);
  const view = scroller.clientHeight,
    from = scroller.scrollTop;
  const padding = scrollPaddingOf(scroller);

  let top: number, height: number;
  const unscaledOffsetsApply = option.offsetParent === scroller;
  if (unscaledOffsetsApply) {
    top = option.offsetTop;
    height = option.offsetHeight;
  } else {
    const bounds = scroller.getBoundingClientRect(),
      rect = option.getBoundingClientRect();
    top = from + rect.top - bounds.top - scroller.clientTop;
    height = rect.bottom - rect.top;
  }

  if (center) scroller.scrollTop = top - (view - height) / 2;
  else if (top < from + padding.top) scroller.scrollTop = top - padding.top;
  else if (top + height > from + view - padding.bottom)
    scroller.scrollTop = top + height - view + padding.bottom;
}

export function revealPopupOption(
  option: HTMLElement | null | undefined,
  { center = false }: { center?: boolean } = {},
) {
  const popup = option?.closest<HTMLElement>('[data-field-popup]');
  if (!option || !popup) return;

  if (center && !firstPlacementLanded.has(popup)) recenterAfterFirstPlacement.set(popup, option);
  scrollWithinPopup(option, popup, center);
}
