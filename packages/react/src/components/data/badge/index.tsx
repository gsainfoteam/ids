import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { useBadge } from './use-badge';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export type BadgePlacement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
export type BadgeShape = 'rectangular' | 'circular';
export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeColorScheme = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

function flag(on: boolean) {
  return on ? '' : undefined;
}

export function Badge({
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
  // `{count > 0 && <Icon />}` leaves false behind, which is no anchor either.
  const standalone = children == null || typeof children === 'boolean';
  const styles = Badge.Style({
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

  // A labelled badge is a live region that reads its label when it changes, so a new count is
  // announced as a sentence; the digits themselves are only for sight.
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

export namespace Badge {
  export type Placement = BadgePlacement;
  export type Shape = BadgeShape;
  export type Variant = BadgeVariant;
  export type ColorScheme = BadgeColorScheme;

  export type State = {
    count: number | undefined;
    dot: boolean;
    invisible: boolean;
    overflowed: boolean;
  };

  export type Props = Omit<ComponentProps<'span'>, 'className' | 'style' | 'content'> & {
    content?: ReactNode;
    dot?: boolean;
    max?: number;
    showZero?: boolean;
    invisible?: boolean;
    placement?: BadgePlacement;
    shape?: BadgeShape;
    variant?: BadgeVariant;
    colorScheme?: BadgeColorScheme;
    size?: IdsSize;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: ReactNode;
  };

  export const Style = tv({
    slots: {
      root: 'relative inline-flex shrink-0 align-middle [--badge-inset:0px]',
      indicator: [
        'inline-flex shrink-0 items-center justify-center rounded-full tabular-nums',
        'whitespace-nowrap select-none',
        'transition-[scale,opacity] duration-(--ids-motion-fast) motion-reduce:transition-none',
        'data-invisible:scale-0 data-invisible:opacity-0',
      ],
    },
    variants: {
      colorScheme: {
        neutral: {
          indicator:
            '[--badge-accent:var(--ids-color-on-surface)] [--badge-fill:var(--ids-color-on-surface)] [--badge-on-fill:var(--ids-color-surface)] [--badge-text:var(--ids-color-on-surface)]',
        },
        primary: {
          indicator:
            '[--badge-accent:var(--ids-color-primary)] [--badge-fill:var(--ids-color-primary)] [--badge-on-fill:var(--ids-color-on-primary)] [--badge-text:var(--ids-color-primary)]',
        },
        success: {
          indicator:
            '[--badge-accent:var(--ids-color-success)] [--badge-fill:var(--ids-color-success)] [--badge-on-fill:var(--ids-color-on-success)] [--badge-text:var(--ids-color-success-strong)]',
        },
        warning: {
          indicator:
            '[--badge-accent:var(--ids-color-warning)] [--badge-fill:var(--ids-color-warning)] [--badge-on-fill:var(--ids-color-on-warning)] [--badge-text:var(--ids-color-warning-strong)]',
        },
        danger: {
          indicator:
            '[--badge-accent:var(--ids-color-danger)] [--badge-fill:var(--ids-color-danger)] [--badge-on-fill:var(--ids-color-on-danger)] [--badge-text:var(--ids-color-danger-strong)]',
        },
        info: {
          indicator:
            '[--badge-accent:var(--ids-color-info)] [--badge-fill:var(--ids-color-info)] [--badge-on-fill:var(--ids-color-on-info)] [--badge-text:var(--ids-color-info-strong)]',
        },
      } satisfies Record<BadgeColorScheme, object>,
      // A badge sits on top of something, so even the tinted fill is opaque.
      variant: {
        solid: { indicator: 'bg-(--badge-fill) text-(--badge-on-fill)' },
        soft: {
          indicator:
            'bg-[color-mix(in_oklab,var(--badge-accent)_16%,var(--ids-color-surface))] text-(--badge-text)',
        },
        outline: {
          indicator:
            'bg-(--ids-color-surface) text-(--badge-text) inset-ring-1 inset-ring-(--badge-accent)/45',
        },
      } satisfies Record<BadgeVariant, object>,
      size: { standard: {}, tiny: {} } satisfies Record<IdsSize, object>,
      dot: { true: {}, false: {} },
      // --badge-inset pulls the badge onto the edge of a round anchor: the point at 45 degrees on
      // a circle lies 14.6% in from its bounding box. An Avatar tells its shape by itself.
      shape: {
        auto: { root: 'has-[>[data-avatar][data-shape=circle]]:[--badge-inset:14.6%]' },
        rectangular: {},
        circular: { root: '[--badge-inset:14.6%]' },
      },
      placement: {
        'top-end': {
          indicator:
            'top-(--badge-inset) end-(--badge-inset) -translate-y-1/2 ltr:translate-x-1/2 rtl:-translate-x-1/2',
        },
        'top-start': {
          indicator:
            'start-(--badge-inset) top-(--badge-inset) -translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2',
        },
        'bottom-end': {
          indicator:
            'end-(--badge-inset) bottom-(--badge-inset) translate-y-1/2 ltr:translate-x-1/2 rtl:-translate-x-1/2',
        },
        'bottom-start': {
          indicator:
            'start-(--badge-inset) bottom-(--badge-inset) translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2',
        },
        none: {},
      } satisfies Record<BadgePlacement | 'none', object>,
    },
    compoundVariants: [
      {
        placement: ['top-end', 'top-start', 'bottom-end', 'bottom-start'],
        class: {
          indicator: ['pointer-events-none absolute z-10', 'ring-2 ring-(--ids-color-surface)'],
        },
      },
      // leading-none follows the text size: cn drops a line height set before it.
      {
        dot: false,
        size: 'standard',
        class: { indicator: 'h-5 min-w-5 px-1.5 text-caption-c1-medium leading-none' },
      },
      {
        dot: false,
        size: 'tiny',
        class: { indicator: 'h-4 min-w-4 px-1 text-caption-c2-medium leading-none' },
      },
      { dot: true, size: 'standard', class: { indicator: 'size-2.5' } },
      { dot: true, size: 'tiny', class: { indicator: 'size-2' } },
    ],
    defaultVariants: {
      variant: 'solid',
      colorScheme: 'danger',
      size: 'standard',
      dot: false,
      shape: 'auto',
      placement: 'top-end',
    },
  });
}
