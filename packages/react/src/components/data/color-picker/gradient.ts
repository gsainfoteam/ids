import type { CSSProperties } from 'react';

export const CHECKER =
  'conic-gradient(var(--ids-color-bg-neutral-soft) 25%, var(--ids-color-bg-base) 0 50%, var(--ids-color-bg-neutral-soft) 0 75%, var(--ids-color-bg-base) 0)';
export const GRADIENT_DIRECTION = 'ltr';
export const overChecker = (css: string): CSSProperties => ({
  backgroundImage: `linear-gradient(${css}, ${css}), ${CHECKER}`,
  backgroundSize: '100% 100%, 8px 8px',
});
