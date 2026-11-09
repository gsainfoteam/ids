'use client';

import { type ComponentProps } from 'react';

import { highlightStyle } from './style';

import type { Highlight } from '.';

export type HighlightMarkProps = ComponentProps<'mark'> & {
  variant?: Highlight.Variant;
};

export function HighlightMark({ variant, className, ...props }: HighlightMarkProps) {
  const { mark } = highlightStyle({ variant });

  return <mark {...props} data-variant={variant ?? 'soft'} className={mark({ className })} />;
}

HighlightMark.displayName = 'Highlight.Mark';
