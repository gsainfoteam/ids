import { tabbable } from 'tabbable';

export const FOCUS_GUARD = '[data-floating-ui-focus-guard]';
export const TOASTER = '[data-toaster]';
export const POPUP_AUTOFOCUS = '[data-popup-autofocus]';

export function elementOf(node: Node | null | undefined) {
  if (!node) return null;
  return node.nodeType === 1 ? (node as Element) : node.parentElement;
}

export function isAlwaysInside(node: Node) {
  return !!elementOf(node)?.closest(`${FOCUS_GUARD}, ${TOASTER}`);
}

export function blurWithin(root: Element | null | undefined) {
  const focused = root?.ownerDocument.activeElement;
  const view = root?.ownerDocument.defaultView;
  if (view && focused instanceof view.HTMLElement && root!.contains(focused)) focused.blur();
}

export type InitialFocusOptions = {
  selector?: string;
  holdsFocus: boolean;
};

export function initialFocusTarget(
  layer: HTMLElement,
  { selector, holdsFocus }: InitialFocusOptions,
) {
  return (
    (selector ? layer.querySelector<HTMLElement>(selector) : null) ??
    layer.querySelector<HTMLElement>(POPUP_AUTOFOCUS) ??
    (holdsFocus ? (tabbable(layer)[0] ?? layer) : null)
  );
}

const returnedFocus = new WeakSet<Element>();

export function returnFocusTo(target: HTMLElement | null | undefined) {
  if (!target?.isConnected) return false;
  returnedFocus.add(target);
  target.focus({ preventScroll: true });
  if (target.ownerDocument.activeElement !== target) {
    returnedFocus.delete(target);
    return false;
  }
  target.addEventListener('focusout', () => returnedFocus.delete(target), { once: true });
  return true;
}

export function focusWasReturned(target: Element) {
  return returnedFocus.has(target);
}
