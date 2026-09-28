import type { GroupOrientation } from '.';
import type { Key } from '@tanstack/react-hotkeys';

export type RovingMove = 'next' | 'previous' | 'first' | 'last';

export type RovingItem = { value: string; disabled: boolean };

export function rovingKeys({
  orientation,
  anyArrow,
}: {
  orientation: GroupOrientation;
  anyArrow: boolean;
}): Partial<Record<Key, RovingMove>> {
  const horizontal = anyArrow || orientation === 'horizontal';
  const vertical = anyArrow || orientation === 'vertical';

  return {
    Home: 'first',
    End: 'last',
    ...(horizontal && { ArrowRight: 'next', ArrowLeft: 'previous' }),
    ...(vertical && { ArrowDown: 'next', ArrowUp: 'previous' }),
  };
}

export function rovingTarget(
  items: readonly RovingItem[],
  from: number,
  move: RovingMove,
  loop: boolean,
): number {
  const enabled = (index: number) => items[index]?.disabled === false;
  if (move === 'first') return rovingTarget(items, -1, 'next', false);
  if (move === 'last') return rovingTarget(items, items.length, 'previous', false);
  const step = move === 'next' ? 1 : -1;
  for (let offset = 1; offset <= items.length; offset++) {
    const raw = from + step * offset;
    if (!loop && (raw < 0 || raw >= items.length)) return -1;
    const index = ((raw % items.length) + items.length) % items.length;
    if (enabled(index)) return index;
  }
  return -1;
}

export function rovingTabStop(
  items: readonly RovingItem[],
  preferred: readonly (string | null | undefined)[],
): string | null {
  for (const value of preferred)
    if (value != null && items.some((item) => item.value === value && !item.disabled)) return value;
  return items.find((item) => !item.disabled)?.value ?? null;
}
