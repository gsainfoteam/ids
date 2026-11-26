'use client';

import { type ComponentProps } from 'react';

import { useInternalBadgeContext } from '../context';
import { badgeDisplay } from '../lib/badge-count';
import { badgeStyle } from '../style';

export type BadgeIndicatorProps = Omit<ComponentProps<'span'>, 'id'> & {
  count?: number;
  max?: number;
};

export const BADGE_MAX = 99;

function flag(on: boolean) {
  return on ? '' : undefined;
}

export function BadgeIndicator({
  count,
  max = BADGE_MAX,
  children,
  className,
  'aria-label': label,
  ...rest
}: BadgeIndicatorProps) {
  const { indicatorId, variant, colorScheme, size, placement } =
    useInternalBadgeContext('Badge.Indicator');
  const display = badgeDisplay(count, children, max);
  const styles = badgeStyle({ variant, colorScheme, size, placement, dot: display.dot });

  return (
    <span
      {...rest}
      id={indicatorId}
      data-badge-indicator=""
      data-dot={flag(display.dot)}
      data-overflow={flag(display.overflowed)}
      className={styles.indicator({ className })}
      {...(label === undefined
        ? { 'aria-hidden': true, children: display.text }
        : {
            role: 'status',
            children: (
              <>
                <span aria-hidden="true">{display.text}</span>
                <span className="sr-only">{label}</span>
              </>
            ),
          })}
    />
  );
}

BadgeIndicator.displayName = 'Badge.Indicator';
