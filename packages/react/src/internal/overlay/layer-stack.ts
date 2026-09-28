import { useLayoutEffect, useRef, useState } from 'react';

import { matchesKeyboardEvent } from '@tanstack/react-hotkeys';
import { tabbable } from 'tabbable';

import { blurWithin, isAlwaysInside } from './focus';
import { isNodeFromAnyWindow } from '../../utils';
import { isComposingKey, keyWithModifiers } from '../keys';

const ESCAPE_WITH_ANY_MODIFIERS = keyWithModifiers('Escape');

export type LayerKind = 'modal' | 'popup' | 'tooltip';

export type DismissReason = 'escape-key' | 'outside-press' | 'focus-out' | 'covered';

export type LayerPosition = { covered: boolean; modalsBelow: number };

export type LayerOptions = {
  kind: LayerKind;
  element: () => HTMLElement | null;
  anchor?: () => Element | null;
  dismissible?: boolean;
  onDismiss: (reason: DismissReason, event?: Event) => void;
  onPositionChange?: (position: LayerPosition) => void;
};

export type Layer = {
  readonly kind: LayerKind;
  element(): HTMLElement | null;
  anchor(): Element | null;
  dismissible(): boolean;
  dismiss(reason: DismissReason, event?: Event): void;
  positionChanged(position: LayerPosition): void;
};

type Entry = { layer: Layer; lastFocused: HTMLElement | null; position: LayerPosition | null };

const stacks = new Map<Document, Entry[]>();
const stopListening = new Map<Document, () => void>();
const openedFrom = new WeakMap<Layer, { focused: Element | null; ownerAnchor: Element | null }>();
const pressedOutside = new Set<Layer>();

function targetOf(event: Event) {
  const target = event.composedPath?.()[0] ?? event.target;
  return isNodeFromAnyWindow(target) ? target : null;
}

function isInside(stack: Entry[], index: number, target: Node) {
  const { layer } = stack[index]!;

  if (layer.element()?.contains(target) || layer.anchor()?.contains(target)) return true;
  if (isAlwaysInside(target)) return true;

  return stack
    .slice(index + 1)
    .some(({ layer: higher }) => higher.kind !== 'tooltip' && !!higher.element()?.contains(target));
}

function lastIndexWhere(stack: Entry[], matches: (entry: Entry) => boolean) {
  for (let index = stack.length - 1; index >= 0; index--) if (matches(stack[index]!)) return index;

  return -1;
}

const isReturnable = (node: Element | null | undefined): node is HTMLElement =>
  !!node &&
  node.isConnected &&
  node !== node.ownerDocument.body &&
  typeof (node as HTMLElement).focus === 'function';

export function focusReturnTarget(layer: Layer) {
  const from = openedFrom.get(layer);
  return [from?.focused, from?.ownerAnchor, layer.anchor()].find(isReturnable) ?? null;
}

export function elementsAbove(layer: Layer) {
  const stack = stacks.get(layer.element()?.ownerDocument ?? document) ?? [];
  const index = stack.findIndex((entry) => entry.layer === layer);

  if (index < 0) return [];

  return stack
    .slice(index + 1)
    .map((entry) => entry.layer.element())
    .filter((element) => element !== null);
}

function pullFocusBack(entry: Entry) {
  const content = entry.layer.element();
  if (!content) return;

  const last = entry.lastFocused;
  const target =
    last?.isConnected && content.contains(last) ? last : (tabbable(content)[0] ?? content);

  target.focus({ preventScroll: true });
}

function updatePositions(stack: Entry[]) {
  let modalsAbove = 0;
  const modalsBelow = stack.filter((entry) => entry.layer.kind === 'modal').length;

  for (let index = stack.length - 1; index >= 0; index--) {
    const entry = stack[index]!;
    if (entry.layer.kind !== 'modal') continue;

    const position = { covered: modalsAbove > 0, modalsBelow: modalsBelow - modalsAbove - 1 };
    modalsAbove++;

    const unchanged =
      entry.position?.covered === position.covered &&
      entry.position.modalsBelow === position.modalsBelow;
    if (unchanged) continue;

    entry.position = position;
    entry.layer.positionChanged(position);
  }
}

function listen(doc: Document, stack: Entry[]) {
  const onKeyDown = (event: KeyboardEvent) => {
    pressedOutside.clear();

    const escape = ESCAPE_WITH_ANY_MODIFIERS.some((hotkey) => matchesKeyboardEvent(event, hotkey));
    if (!escape || event.defaultPrevented || isComposingKey(event)) return;

    const top = stack.at(-1)?.layer;
    if (!top?.dismissible()) return;

    event.preventDefault();
    top.dismiss('escape-key', event);
  };

  const onPointerDown = (event: PointerEvent) => {
    pressedOutside.clear();

    const target = targetOf(event);
    if (!target) return;
    const snapshot = [...stack];

    for (const { layer } of snapshot)
      if (layer.kind === 'tooltip' && !layer.element()?.contains(target))
        layer.dismiss('outside-press', event);

    for (let index = snapshot.length - 1; index >= 0; index--) {
      const { layer } = snapshot[index]!;
      if (layer.kind === 'tooltip') continue;
      if (layer.kind === 'modal' || !layer.dismissible()) return;
      if (isInside(snapshot, index, target)) return;

      blurWithin(layer.element());
      pressedOutside.add(layer);
      layer.dismiss('outside-press', event);
    }
  };

  const onFocusIn = (event: FocusEvent) => {
    const target = targetOf(event);
    if (!target) return;

    const snapshot = [...stack];
    const topModal = lastIndexWhere(snapshot, (entry) => entry.layer.kind === 'modal');

    for (let index = snapshot.length - 1; index > topModal; index--) {
      const { layer } = snapshot[index]!;
      if (layer.kind === 'tooltip') continue;
      if (isInside(snapshot, index, target)) break;
      if (pressedOutside.has(layer) || !layer.dismissible()) continue;

      layer.dismiss('focus-out', event);
    }

    const modal = snapshot[topModal];
    if (!modal) return;

    if (modal.layer.element()?.contains(target)) {
      modal.lastFocused = target as HTMLElement;
      return;
    }

    const returning = focusReturnTarget(modal.layer)?.contains(target);
    if (!returning && !isInside(snapshot, topModal, target)) pullFocusBack(modal);
  };

  doc.addEventListener('keydown', onKeyDown);
  doc.addEventListener('pointerdown', onPointerDown);
  doc.addEventListener('focusin', onFocusIn);

  stopListening.set(doc, () => {
    doc.removeEventListener('keydown', onKeyDown);
    doc.removeEventListener('pointerdown', onPointerDown);
    doc.removeEventListener('focusin', onFocusIn);
  });
}

export function registerLayer(doc: Document, layer: Layer) {
  let stack = stacks.get(doc);
  if (!stack) {
    stack = [];
    stacks.set(doc, stack);
    listen(doc, stack);
  }

  const focused = doc.activeElement;
  const owner = lastIndexWhere(
    stack,
    (open) => !!focused && !!open.layer.element()?.contains(focused),
  );
  openedFrom.set(layer, { focused, ownerAnchor: stack[owner]?.layer.anchor() ?? null });

  const entry: Entry = { layer, lastFocused: null, position: null };
  const element = layer.element();
  const openedInTheSameCommitInside = stack.findIndex(
    (open) => !!element && !!open.layer.element() && element.contains(open.layer.element()),
  );

  if (openedInTheSameCommitInside >= 0) stack.splice(openedInTheSameCommitInside, 0, entry);
  else stack.push(entry);

  if (layer.kind === 'modal')
    for (const { layer: open } of [...stack]) if (open.kind === 'tooltip') open.dismiss('covered');

  updatePositions(stack);

  return () => {
    const index = stack.indexOf(entry);
    if (index >= 0) stack.splice(index, 1);
    pressedOutside.delete(layer);
    updatePositions(stack);

    if (stack.length > 0) return;
    stacks.delete(doc);
    stopListening.get(doc)?.();
    stopListening.delete(doc);
  };
}

export function useLayer(active: boolean, options: LayerOptions) {
  const latest = useRef(options);

  useLayoutEffect(() => {
    latest.current = options;
  });

  const [layer] = useState<Layer>(() => ({
    get kind() {
      return latest.current.kind;
    },
    element: () => latest.current.element(),
    anchor: () => latest.current.anchor?.() ?? null,
    dismissible: () => latest.current.dismissible ?? true,
    dismiss: (reason, event) => latest.current.onDismiss(reason, event),
    positionChanged: (position) => latest.current.onPositionChange?.(position),
  }));

  const { kind } = options;

  useLayoutEffect(() => {
    if (!active) return;

    const doc = layer.element()?.ownerDocument ?? document;
    return registerLayer(doc, layer);
  }, [active, kind, layer]);

  return layer;
}
