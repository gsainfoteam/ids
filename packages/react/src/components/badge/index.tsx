import type { ComponentProps, ReactNode } from 'react';

import { invariant, tv } from '../../utils';

import type { IdsSize } from '../../tokens/types';

export function Badge({
  content,
  dot = false,
  max = 99,
  showZero = false,
  placement = 'top-right',
  shape = 'rectangular',
  colorScheme = 'danger',
  size = 'standard',
  className,
  children,
  'aria-label': ariaLabel,
  ...rest
}: Badge.Props) {
  invariant(dot || content != null, '`<Badge>` requires `content`, or `dot` for a bare indicator.');

  const empty = typeof content === 'number' && content === 0 && !showZero;
  const visible = dot || !empty;
  const label = typeof content === 'number' && content > max ? `${max}+` : (content ?? null);

  const { root, indicator } = Badge.Style({ colorScheme, placement, shape, size, dot });

  return (
    <span {...rest} className={root({ className })}>
      {children}
      {visible ? (
        <span
          {...(ariaLabel == null
            ? { 'aria-hidden': dot }
            : { role: 'status', 'aria-label': ariaLabel })}
          className={indicator()}
        >
          {dot ? null : label}
        </span>
      ) : null}
    </span>
  );
}

export namespace Badge {
  export const Style = tv({
    slots: {
      root: 'relative inline-flex shrink-0 align-middle',
      indicator: [
        'pointer-events-none absolute z-10 inline-flex items-center justify-center',
        'rounded-full tabular-nums ring-2 ring-(--ids-color-surface)',
        'bg-(--badge-fill) text-(--badge-on-fill)',
      ],
    },
    variants: {
      colorScheme: {
        neutral: {
          indicator:
            '[--badge-fill:var(--ids-color-muted)] [--badge-on-fill:var(--ids-color-on-surface)]',
        },
        primary: {
          indicator:
            '[--badge-fill:var(--ids-color-primary)] [--badge-on-fill:var(--ids-color-on-primary)]',
        },
        success: {
          indicator:
            '[--badge-fill:var(--ids-color-success)] [--badge-on-fill:var(--ids-color-on-success)]',
        },
        warning: {
          indicator:
            '[--badge-fill:var(--ids-color-warning)] [--badge-on-fill:var(--ids-color-on-warning)]',
        },
        danger: {
          indicator:
            '[--badge-fill:var(--ids-color-danger)] [--badge-on-fill:var(--ids-color-on-danger)]',
        },
        info: {
          indicator:
            '[--badge-fill:var(--ids-color-info)] [--badge-on-fill:var(--ids-color-on-info)]',
        },
      },
      placement: {
        'top-right': { indicator: 'top-0 right-0' },
        'top-left': { indicator: 'top-0 left-0' },
        'bottom-right': { indicator: 'right-0 bottom-0' },
        'bottom-left': { indicator: 'bottom-0 left-0' },
      },
      shape: { rectangular: {}, circular: {} },
      size: { standard: {}, tiny: {} } satisfies Record<IdsSize, object>,
      dot: { true: {}, false: {} },
    },
    compoundVariants: [
      {
        dot: false,
        size: 'standard',
        class: { indicator: 'text-caption-c2-medium h-5 min-w-5 px-1.5' },
      },
      {
        dot: false,
        size: 'tiny',
        class: { indicator: 'h-4 min-w-4 px-1 text-[10px]/none font-medium' },
      },
      { dot: true, size: 'standard', class: { indicator: 'size-2.5' } },
      { dot: true, size: 'tiny', class: { indicator: 'size-2' } },

      {
        shape: 'rectangular',
        placement: 'top-right',
        class: { indicator: '-translate-y-1/2 translate-x-1/2' },
      },
      {
        shape: 'rectangular',
        placement: 'top-left',
        class: { indicator: '-translate-x-1/2 -translate-y-1/2' },
      },
      {
        shape: 'rectangular',
        placement: 'bottom-right',
        class: { indicator: 'translate-x-1/2 translate-y-1/2' },
      },
      {
        shape: 'rectangular',
        placement: 'bottom-left',
        class: { indicator: '-translate-x-1/2 translate-y-1/2' },
      },

      {
        shape: 'circular',
        placement: 'top-right',
        class: { indicator: 'top-[14%] right-[14%] -translate-y-1/2 translate-x-1/2' },
      },
      {
        shape: 'circular',
        placement: 'top-left',
        class: { indicator: 'top-[14%] left-[14%] -translate-x-1/2 -translate-y-1/2' },
      },
      {
        shape: 'circular',
        placement: 'bottom-right',
        class: { indicator: 'right-[14%] bottom-[14%] translate-x-1/2 translate-y-1/2' },
      },
      {
        shape: 'circular',
        placement: 'bottom-left',
        class: { indicator: 'bottom-[14%] left-[14%] -translate-x-1/2 translate-y-1/2' },
      },
    ],
    defaultVariants: {
      colorScheme: 'danger',
      placement: 'top-right',
      shape: 'rectangular',
      size: 'standard',
      dot: false,
    },
  });

  export type Props = Omit<ComponentProps<'span'>, 'className' | 'content'> & {
    content?: ReactNode;
    dot?: boolean;
    max?: number;
    showZero?: boolean;
    placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    shape?: 'rectangular' | 'circular';
    colorScheme?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    size?: IdsSize;
    className?: string;
    children?: ReactNode;
  };
}
