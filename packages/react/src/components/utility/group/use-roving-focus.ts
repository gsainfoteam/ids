'use client';

import { useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

import { mapValues } from 'es-toolkit';
import { focusable } from 'tabbable';

import {
  rovingKeys,
  rovingTabStop,
  rovingTarget,
  type RovingItem,
  type RovingMove,
} from './roving';
import { keyHandler } from '../../../internal/keys';

import type { GroupOrientation } from '.';

export type RovingElement = RovingItem & { element: HTMLElement };

type Options = {
  rootRef: RefObject<HTMLElement | null>;
  ownItemSelector: string;
  orientation: GroupOrientation;
  loop: boolean;
  radio: boolean;
  checked: string | null;
  onArrive?: (element: HTMLElement) => void;
};

function scan(root: HTMLElement | null, selector: string): RovingElement[] {
  if (!root) return [];
  const reachable = new Set(focusable(root, { displayCheck: 'full-native' }));
  return Array.from(root.querySelectorAll<HTMLElement>(selector), (element) => ({
    element,
    value: element.dataset.value ?? '',
    disabled: !reachable.has(element) || element.getAttribute('aria-disabled') === 'true',
  }));
}

function sameItems(previous: readonly RovingItem[] | null, next: readonly RovingItem[]) {
  return (
    previous !== null &&
    previous.length === next.length &&
    previous.every(
      (item, index) => item.value === next[index]!.value && item.disabled === next[index]!.disabled,
    )
  );
}

function isRtl(element: HTMLElement) {
  const direction = element.ownerDocument.defaultView?.getComputedStyle(element).direction;
  if (direction) return direction === 'rtl';
  return element.closest('[dir]')?.getAttribute('dir') === 'rtl';
}

export function useRovingFocus({
  rootRef,
  ownItemSelector,
  orientation,
  loop,
  radio,
  checked,
  onArrive,
}: Options) {
  const [items, setItems] = useState<RovingItem[] | null>(null);
  const [lastFocused, setLastFocused] = useState<string | null>(null);
  const elements = useRef<RovingElement[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const scanned = scan(rootRef.current, ownItemSelector);
    elements.current = scanned;
    setItems((previous) =>
      sameItems(previous, scanned)
        ? previous
        : scanned.map(({ value, disabled }) => ({ value, disabled })),
    );
  });

  const tabStop =
    items === null ? undefined : rovingTabStop(items, radio ? [checked] : [lastFocused]);

  const onItemFocus = (value: string) => setLastFocused(value);

  const onItemKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const root = rootRef.current;
    if (!root) return;

    const moveFocus = (move: RovingMove) => () => {
      const scanned = scan(root, ownItemSelector);
      const from = scanned.findIndex(({ element }) => element === event.currentTarget);
      if (from === -1) return false;

      const to = rovingTarget(scanned, from, move, loop);
      if (to === -1 || to === from) return;

      const target = scanned[to]!.element;
      target.focus();
      onArrive?.(target);
    };

    const keys = mapValues(rovingKeys({ orientation, anyArrow: radio }), (move) =>
      moveFocus(move!),
    );
    keyHandler(keys, { dir: isRtl(root) ? 'rtl' : 'ltr' })(event);
  };

  return { items, elements, tabStop, onItemFocus, onItemKeyDown };
}
