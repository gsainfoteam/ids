'use client';

import { useRef } from 'react';

import { BadgeContext } from './context';
import { useInternalBadge } from './hooks/use-badge';
import { useInternalBadgeInset } from './hooks/use-badge-inset';
import { badgeStyle } from './style';
import { resolveState } from '../../../internal/lib/state-props';
import { mergeRefs } from '../../../utils';

import type { Badge } from '.';

export type BadgePlacement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeColorScheme =
  'neutral' | 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'info';

export function BadgeRoot({
  placement = 'top-end',
  variant = 'solid',
  colorScheme = 'danger',
  size = 'standard',
  className,
  style,
  children,
  ref,
  ...rest
}: Badge.Props) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const { indicatorId, indicator, display, anchor } = useInternalBadge(children);
  useInternalBadgeInset(rootRef, placement);

  const styles = badgeStyle({ placement });
  const state: Badge.State = {
    count: display?.count,
    dot: display?.dot ?? false,
    overflowed: display?.overflowed ?? false,
  };

  return (
    <BadgeContext value={{ indicatorId, variant, colorScheme, size, placement }}>
      <span
        {...rest}
        ref={mergeRefs(ref, rootRef)}
        data-badge=""
        data-placement={placement}
        className={styles.root({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        {anchor}
        {indicator}
      </span>
    </BadgeContext>
  );
}
