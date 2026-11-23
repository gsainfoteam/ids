'use client';

import { useRef } from 'react';

import { badgeStyle } from './style';
import { useBadge } from './use-badge';
import { useBadgeInset } from './use-badge-inset';
import { resolveState } from '../../../internal/state-props';
import { mergeRefs } from '../../../utils';

import type { Badge } from '.';

export type BadgePlacement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeColorScheme =
  'neutral' | 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'info';

function flag(on: boolean) {
  return on ? '' : undefined;
}

export function BadgeRoot({
  content,
  dot = false,
  max = 99,
  showZero = false,
  invisible = false,
  placement = 'top-end',
  variant = 'solid',
  colorScheme,
  size = 'standard',
  className,
  style,
  children,
  ref,
  'aria-label': label,
  ...rest
}: Badge.Props) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const { indicatorId, display, hidden, anchor } = useBadge({
    content,
    dot,
    max,
    showZero,
    invisible,
    label,
    children,
  });
  const standalone = children == null || typeof children === 'boolean';
  useBadgeInset(rootRef, standalone ? null : placement, anchor);

  const styles = badgeStyle({
    variant,
    colorScheme: colorScheme ?? (standalone ? 'neutral' : 'danger'),
    size,
    dot,
    placement: standalone ? 'none' : placement,
  });
  const state: Badge.State = {
    count: display.count,
    dot,
    invisible: hidden,
    overflowed: display.overflowed,
  };
  const text = dot ? null : display.text;

  const indicator = {
    id: indicatorId,
    'data-badge-indicator': '',
    'data-dot': flag(dot),
    'data-invisible': flag(hidden),
    'data-overflow': flag(display.overflowed),
    ...(label === undefined
      ? { 'aria-hidden': true, children: text }
      : {
          role: 'status',
          children: (
            <>
              <span aria-hidden="true">{text}</span>
              <span className="sr-only">{label}</span>
            </>
          ),
        }),
  };

  if (standalone)
    return (
      <span
        {...rest}
        {...indicator}
        ref={ref}
        data-badge=""
        className={styles.indicator({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      />
    );

  return (
    <span
      {...rest}
      ref={mergeRefs(ref, rootRef)}
      data-badge=""
      data-placement={placement}
      className={styles.root({ className: resolveState(className, state) })}
      style={resolveState(style, state)}
    >
      {anchor}
      <span {...indicator} className={styles.indicator()} />
    </span>
  );
}
