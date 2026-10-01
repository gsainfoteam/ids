'use client';

import { badgeStyle } from './style';
import { useBadge } from './use-badge';
import { resolveState } from '../../../internal/state-props';

import type { Badge } from '.';

export type BadgePlacement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
export type BadgeShape = 'rectangular' | 'circular';
export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeColorScheme = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

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
  shape,
  variant = 'solid',
  colorScheme = 'danger',
  size = 'standard',
  className,
  style,
  children,
  'aria-label': label,
  ...rest
}: Badge.Props) {
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
  const styles = badgeStyle({
    variant,
    colorScheme,
    size,
    dot,
    placement: standalone ? 'none' : placement,
    shape: shape ?? 'auto',
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
        data-badge=""
        className={styles.indicator({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      />
    );

  return (
    <span
      {...rest}
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
