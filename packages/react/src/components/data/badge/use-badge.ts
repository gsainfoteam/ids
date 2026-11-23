'use client';

import {
  cloneElement,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react';

import { badgeDisplay } from './badge-count';
import { isDevelopment } from '../../../utils/dev';

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
  const wrapsOneElement = isValidElement(children);
  useEffect(() => {
    if (isDevelopment && !wrapsOneElement)
      console.warn('[IDS] Badge: wrap exactly one element. A badge on its own is a Chip.');
  }, [wrapsOneElement]);

  const dot = content === undefined;
  const display = badgeDisplay(content, max, showZero);
  const hidden = invisible || (!dot && display.empty);

  const describes = label === undefined && !dot && !hidden;
  const anchor =
    describes && isValidElement(children) && children.type !== Fragment
      ? cloneElement(children as Describable, {
          'aria-describedby': [(children as Describable).props['aria-describedby'], indicatorId]
            .filter(Boolean)
            .join(' '),
        })
      : children;

  return { indicatorId, dot, display, hidden, anchor };
}
