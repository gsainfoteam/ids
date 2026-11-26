import type { ReactNode } from 'react';

export type BadgeDisplay = {
  count: number | undefined;
  text: ReactNode;
  overflowed: boolean;
  dot: boolean;
};

export function badgeDisplay(
  count: number | undefined,
  children: ReactNode,
  max: number,
): BadgeDisplay {
  if (count === undefined) {
    const dot = children == null || children === false || children === '';
    return { count: undefined, text: dot ? null : children, overflowed: false, dot };
  }

  const whole = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const cap = Math.max(0, Math.floor(max));
  const overflowed = whole > cap;
  return { count: whole, text: overflowed ? `${cap}+` : String(whole), overflowed, dot: false };
}
