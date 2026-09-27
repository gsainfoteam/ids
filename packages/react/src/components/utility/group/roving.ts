import type { GroupOrientation } from '.';

export type RovingMove = 'next' | 'previous' | 'first' | 'last';

export type RovingItem = { value: string; disabled: boolean };

export function rovingMove(
  key: string,
  {
    orientation,
    rtl,
    anyArrow,
  }: { orientation: GroupOrientation; rtl: boolean; anyArrow: boolean },
): RovingMove | undefined {
  if (key === 'Home') return 'first';
  if (key === 'End') return 'last';
  const horizontal = anyArrow || orientation === 'horizontal';
  const vertical = anyArrow || orientation === 'vertical';
  if (horizontal && key === 'ArrowRight') return rtl ? 'previous' : 'next';
  if (horizontal && key === 'ArrowLeft') return rtl ? 'next' : 'previous';
  if (vertical && key === 'ArrowDown') return 'next';
  if (vertical && key === 'ArrowUp') return 'previous';
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
