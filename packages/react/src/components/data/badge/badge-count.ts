import type { ReactNode } from 'react';

export type BadgeDisplay = {
  count: number | undefined;
  text: ReactNode;
  overflowed: boolean;
  empty: boolean;
};

export function badgeDisplay(content: ReactNode, max: number, showZero: boolean): BadgeDisplay {
  if (typeof content !== 'number')
    return {
      count: undefined,
      text: content,
      overflowed: false,
      empty: content == null || content === false || content === '',
    };

  const count = Number.isFinite(content) ? Math.max(0, Math.floor(content)) : 0;
  const cap = Math.max(0, Math.floor(max));
  const overflowed = count > cap;
  return {
    count,
    text: overflowed ? `${cap}+` : String(count),
    overflowed,
    empty: count === 0 && !showZero,
  };
}
