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
  dot,
  max,
  showZero,
  invisible,
  label,
  children,
}: {
  content: ReactNode;
  dot: boolean;
  max: number;
  showZero: boolean;
  invisible: boolean;
  label: string | undefined;
  children: ReactNode;
}) {
  const indicatorId = `${useId()}-badge`;
  useEffect(() => {
    if (isDevelopment && content === undefined && !dot)
      console.warn('[IDS] Badge: pass content, or dot for an indicator without text.');
  }, [content, dot]);

  const display = badgeDisplay(content, max, showZero);
  const hidden = invisible || (!dot && display.empty);

  // An unlabelled count is read as a description of what it is attached to ("Notifications,
  // button, 3") instead of as a stray number after it.
  const describes = label === undefined && !dot && !hidden;
  const anchor =
    describes && isValidElement(children) && children.type !== Fragment
      ? cloneElement(children as Describable, {
          'aria-describedby': [(children as Describable).props['aria-describedby'], indicatorId]
            .filter(Boolean)
            .join(' '),
        })
      : children;

  return { indicatorId, display, hidden, anchor };
}
