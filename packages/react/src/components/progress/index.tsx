import { createContext, useContext } from 'react';
import type { ComponentProps, ReactNode } from 'react';

import { cn, invariant, tv } from '../../utils';
import { Slot } from '../slot';

import type { IdsSize } from '../../tokens/types';

const RADIUS = 9;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type ProgressContextValue = { value: number | null; max: number };

const ProgressContext = createContext<ProgressContextValue | null>(null);

function useProgressContext(component: string) {
  const context = useContext(ProgressContext);
  invariant(context != null, `\`<${component}>\` must be used inside \`<Progress>\`.`);
  return context;
}

export function Progress({
  value,
  max = 100,
  indeterminate = false,
  shape = 'linear',
  size = 'standard',
  colorScheme = 'primary',
  className,
  children,
  ...rest
}: Progress.Props) {
  invariant(max > 0, '`<Progress>` `max` must be greater than 0.');
  invariant(value == null || value >= 0, '`<Progress>` `value` must not be negative.');
  invariant(
    value == null || value <= max,
    `\`<Progress>\` \`value\` must not exceed \`max\` (${max}).`,
  );

  const running = indeterminate || value == null;
  const current = running ? null : value;
  const ratio = current == null ? 0 : current / max;

  const aria = {
    role: 'progressbar' as const,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    ...(current == null ? {} : { 'aria-valuenow': current }),
  };

  if (shape === 'circular') {
    return (
      <ProgressContext.Provider value={{ value: current, max }}>
        <div {...aria} {...rest} className={Progress.Circle({ size, colorScheme, className })}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={cn('size-full', running && 'animate-spin motion-reduce:animate-none')}
          >
            <circle
              cx="12"
              cy="12"
              r={RADIUS}
              stroke="currentColor"
              strokeWidth="3"
              className="text-(--ids-color-muted)"
            />
            <circle
              cx="12"
              cy="12"
              r={RADIUS}
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="origin-center -rotate-90 text-(--progress-fill) transition-[stroke-dashoffset] duration-(--ids-motion-normal) motion-reduce:transition-none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - (running ? 0.25 : ratio))}
            />
          </svg>
          {children == null ? null : (
            <span className="absolute inset-0 flex items-center justify-center">{children}</span>
          )}
        </div>
      </ProgressContext.Provider>
    );
  }

  return (
    <ProgressContext.Provider value={{ value: current, max }}>
      <div {...rest} className={Progress.Style({ colorScheme, className })}>
        {children == null ? null : (
          <div className="flex items-baseline justify-between gap-2">{children}</div>
        )}
        <div {...aria} className={Progress.Track({ size })}>
          <div
            className={cn(
              'h-full rounded-full bg-(--progress-fill)',
              running
                ? 'animate-progress-slide w-1/4 motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-40'
                : 'transition-[width] duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
            )}
            style={running ? undefined : { width: `${ratio * 100}%` }}
          />
        </div>
      </div>
    </ProgressContext.Provider>
  );
}

export namespace Progress {
  const scheme = {
    primary: '[--progress-fill:var(--ids-color-primary)]',
    success: '[--progress-fill:var(--ids-color-success)]',
    warning: '[--progress-fill:var(--ids-color-warning)]',
    danger: '[--progress-fill:var(--ids-color-danger)]',
    neutral: '[--progress-fill:var(--ids-color-on-muted)]',
  } as const;

  export const Style = tv({
    base: 'flex w-full flex-col gap-1.5',
    variants: { colorScheme: scheme },
    defaultVariants: { colorScheme: 'primary' },
  });

  export const Track = tv({
    base: 'w-full overflow-hidden rounded-full bg-(--ids-color-muted)',
    variants: {
      size: {
        standard: 'h-2',
        tiny: 'h-1',
      } satisfies Record<IdsSize, string>,
    },
    defaultVariants: { size: 'standard' },
  });

  export const Circle = tv({
    base: 'relative inline-flex shrink-0 items-center justify-center',
    variants: {
      colorScheme: scheme,
      size: {
        standard: 'size-10 text-caption-c2-medium',
        tiny: 'size-6 text-[9px]/none font-medium',
      } satisfies Record<IdsSize, string>,
    },
    defaultVariants: { colorScheme: 'primary', size: 'standard' },
  });

  export function Label({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'span';
    return <Root {...rest} className={cn('text-body-b3-medium truncate', className)} />;
  }

  export function Value({ asChild, className, children, ...rest }: PartProps) {
    const { value, max } = useProgressContext('Progress.Value');
    const Root = asChild === true ? Slot : 'span';

    return (
      <Root
        {...rest}
        className={cn('shrink-0 text-(--ids-color-on-muted) tabular-nums', className)}
      >
        {children ?? (value == null ? '' : `${Math.round((value / max) * 100)}%`)}
      </Root>
    );
  }

  export type PartProps = Omit<ComponentProps<'span'>, 'className'> & {
    asChild?: boolean;
    className?: string;
  };

  export type Props = Omit<ComponentProps<'div'>, 'children' | 'className' | 'role'> & {
    value?: number;
    max?: number;
    indeterminate?: boolean;
    shape?: 'linear' | 'circular';
    size?: IdsSize;
    colorScheme?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
    className?: string;
    children?: ReactNode;
  };
}
