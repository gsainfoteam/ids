import type { CSSProperties } from 'react';

export const CHECKER =
  'conic-gradient(var(--ids-color-muted) 25%, var(--ids-color-surface) 0 50%, var(--ids-color-muted) 0 75%, var(--ids-color-surface) 0)';
export const GRADIENT_DIRECTION = 'ltr';
export const overChecker = (css: string): CSSProperties => ({
  backgroundImage: `linear-gradient(${css}, ${css}), ${CHECKER}`,
  backgroundSize: '100% 100%, 8px 8px',
});
