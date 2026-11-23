'use client';

import { Children, cloneElement, Fragment, useId, type ReactElement, type ReactNode } from 'react';

import { badgeDisplay } from './badge-count';

type Describable = ReactElement<{ 'aria-describedby'?: string }>;

export function useBadge({
  content,
  max,
  showZero,
  invisible,
  label,
  children,
}: {
  content: ReactNode;
  max: number;
  showZero: boolean;
  invisible: boolean;
  label: string | undefined;
  children: ReactElement;
}) {
  const indicatorId = `${useId()}-badge`;
  const child = Children.only(children);

  const dot = content === undefined;
  const display = badgeDisplay(content, max, showZero);
  const hidden = invisible || (!dot && display.empty);

  const describes = label === undefined && !dot && !hidden;
  const anchor =
    describes && child.type !== Fragment
      ? cloneElement(child as Describable, {
          'aria-describedby': [(child as Describable).props['aria-describedby'], indicatorId]
            .filter(Boolean)
            .join(' '),
        })
      : child;

  return { indicatorId, dot, display, hidden, anchor };
}
