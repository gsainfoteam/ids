import { createContext, useContext } from 'react';
import type { ComponentProps, ReactNode } from 'react';

import { invariant, tv } from '../../utils';
import { Arc } from '../arc';
import { Slot } from '../slot';

import type { IdsSize } from '../../tokens/types';

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

  const { root, track, bar, circle } = Progress.Style({ colorScheme, size, running });

  if (shape === 'circular') {
    return (
      <ProgressContext.Provider value={{ value: current, max }}>
        <div {...aria} {...rest} className={circle({ className })}>
          <Arc
            ratio={running ? 0.25 : ratio}
            spin={running}
            trackClassName="text-(--ids-color-muted)"
            indicatorClassName="text-(--progress-fill) transition-[stroke-dashoffset] duration-(--ids-motion-normal) motion-reduce:transition-none"
          />
          {children == null ? null : (
            <span className="absolute inset-0 flex items-center justify-center">{children}</span>
          )}
        </div>
      </ProgressContext.Provider>
    );
  }

  return (
    <ProgressContext.Provider value={{ value: current, max }}>
      <div {...rest} className={root({ className })}>
        {children == null ? null : (
          <div className="flex items-baseline justify-between gap-2">{children}</div>
        )}
        <div {...aria} className={track()}>
          <div className={bar()} style={running ? undefined : { width: `${ratio * 100}%` }} />
        </div>
      </div>
    </ProgressContext.Provider>
  );
}

export namespace Progress {
  export const Style = tv({
    slots: {
      root: 'flex w-full flex-col gap-1.5',
      track: 'w-full overflow-hidden rounded-full bg-(--ids-color-muted)',
      bar: 'h-full rounded-full bg-(--progress-fill)',
      circle: 'relative inline-flex shrink-0 items-center justify-center',
      label: 'text-body-b3-medium truncate',
      value: 'shrink-0 text-(--ids-color-on-muted) tabular-nums',
    },
    variants: {
      colorScheme: {
        primary: {
          root: '[--progress-fill:var(--ids-color-primary)]',
          circle: '[--progress-fill:var(--ids-color-primary)]',
        },
        success: {
          root: '[--progress-fill:var(--ids-color-success)]',
          circle: '[--progress-fill:var(--ids-color-success)]',
        },
        warning: {
          root: '[--progress-fill:var(--ids-color-warning)]',
          circle: '[--progress-fill:var(--ids-color-warning)]',
        },
        danger: {
          root: '[--progress-fill:var(--ids-color-danger)]',
          circle: '[--progress-fill:var(--ids-color-danger)]',
        },
        neutral: {
          root: '[--progress-fill:var(--ids-color-on-muted)]',
          circle: '[--progress-fill:var(--ids-color-on-muted)]',
        },
      },
      size: {
        standard: { track: 'h-2', circle: 'text-caption-c2-medium size-10' },
        tiny: { track: 'h-1', circle: 'size-6 text-[9px]/none font-medium' },
      } satisfies Record<IdsSize, { track: string; circle: string }>,
      running: {
        true: {
          bar: 'animate-progress-slide w-1/4 motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-40',
        },
        false: {
          bar: 'transition-[width] duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
        },
      },
    },
    defaultVariants: { colorScheme: 'primary', size: 'standard', running: false },
  });

  export function Label({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'span';
    return <Root {...rest} className={Style().label({ className })} />;
  }

  export function Value({ asChild, className, children, ...rest }: PartProps) {
    const { value, max } = useProgressContext('Progress.Value');
    const Root = asChild === true ? Slot : 'span';

    return (
      <Root {...rest} className={Style().value({ className })}>
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
