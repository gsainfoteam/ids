import {
  createContext,
  isValidElement,
  use,
  useId,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { useProgress } from './use-progress';
import { ARC_CIRCUMFERENCE, ARC_RADIUS } from '../../../internal/arc';
import { flattenFragments, invariant, tv } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { IdsSize } from '../../../tokens/types';

type Context = {
  state: Progress.State;
  styles: ReturnType<typeof Progress.Style>;
  labelId: string;
  progressbar: Record<string, unknown>;
};

const ProgressContext = createContext<Context | null>(null);

function useProgressContext(part: string) {
  const context = use(ProgressContext);
  invariant(context, `${part} must be rendered inside Progress.`);
  return context;
}

function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

function isPart(node: ReactNode, part: unknown): node is ReactElement<Record<string, unknown>> {
  return isValidElement(node) && node.type === part;
}

export function Progress({
  value,
  max = 100,
  indeterminate = false,
  shape = 'linear',
  size = 'standard',
  colorScheme = 'primary',
  getValueLabel,
  className,
  style,
  children,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-valuetext': ariaValueText,
  ...rest
}: Progress.Props) {
  const generatedId = useId();
  const nodes = flattenFragments(children);
  const label = nodes.find((node) => isPart(node, Progress.Label));
  const labelId =
    (isValidElement<{ id?: string }>(label) ? label.props.id : undefined) ?? `${generatedId}-label`;

  const progress = useProgress({
    value,
    max,
    indeterminate,
    getValueLabel,
    labelled: ariaLabel !== undefined || ariaLabelledBy !== undefined || label !== undefined,
  });
  const state: Progress.State = { ...progress, shape, size, colorScheme };
  const styles = Progress.Style({ shape, size, colorScheme, indeterminate: state.indeterminate });

  // A progressbar's children are presentational, so the name comes from the Label by reference.
  const progressbar = {
    role: 'progressbar',
    id,
    'aria-label': ariaLabel,
    'aria-labelledby':
      ariaLabelledBy ?? (ariaLabel === undefined && label !== undefined ? labelId : undefined),
    'aria-describedby': ariaDescribedBy,
    'aria-valuemin': 0,
    'aria-valuemax': state.max,
    'aria-valuenow': state.value ?? undefined,
    'aria-valuetext': ariaValueText ?? state.valueLabel,
  };

  const root = {
    ...rest,
    'data-progress': '',
    'data-shape': shape,
    'data-size': size,
    'data-indeterminate': state.indeterminate ? '' : undefined,
    'data-complete': state.complete ? '' : undefined,
    className: styles.root({ className: resolve(className, state) }),
    style: resolve(style, state),
  };

  const trackIndex = nodes.findIndex((node) => isPart(node, Progress.Track));
  const indicator = nodes.find((node) => isPart(node, Progress.Indicator));
  const content = nodes.filter(
    (node) => !isPart(node, Progress.Track) && !isPart(node, Progress.Indicator),
  );
  const contentBefore = (index: number) =>
    nodes.slice(0, index).filter((node) => content.includes(node)).length;

  const context = { state, styles, labelId, progressbar };

  if (shape === 'circular') {
    const center = content.filter((node) => !isPart(node, Progress.Label));
    const labels = content.filter((node) => isPart(node, Progress.Label));
    return (
      <ProgressContext value={context}>
        <div {...root}>
          <div {...progressbar} className={styles.circle()}>
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={styles.svg()}>
              {trackIndex === -1 ? <Progress.Track /> : nodes[trackIndex]}
              {indicator ?? <Progress.Indicator />}
            </svg>
            {center.length > 0 && <span className={styles.center()}>{center}</span>}
          </div>
          {labels}
        </div>
      </ProgressContext>
    );
  }

  // Children before a Progress.Track sit above the bar and children after it below, so the order
  // they are written in is the order they appear.
  const leading = trackIndex === -1 ? content : content.slice(0, contentBefore(trackIndex));
  const trailing = trackIndex === -1 ? [] : content.slice(contentBefore(trackIndex));
  const track =
    trackIndex === -1 ? <Progress.Track>{indicator}</Progress.Track> : nodes[trackIndex];

  return (
    <ProgressContext value={context}>
      <div {...root}>
        {leading.length > 0 && <div className={styles.header()}>{leading}</div>}
        {track}
        {trailing.length > 0 && <div className={styles.header()}>{trailing}</div>}
      </div>
    </ProgressContext>
  );
}

export namespace Progress {
  export type Shape = 'linear' | 'circular';
  export type ColorScheme = 'primary' | 'neutral' | 'info' | 'success' | 'warning' | 'danger';

  export type State = {
    value: number | null;
    max: number;
    percent: number | null;
    valueLabel: string | undefined;
    indeterminate: boolean;
    complete: boolean;
    shape: Shape;
    size: IdsSize;
    colorScheme: ColorScheme;
  };

  export type Props = Omit<
    ComponentProps<'div'>,
    'children' | 'className' | 'style' | 'role' | 'defaultValue'
  > & {
    value?: number | null;
    max?: number;
    indeterminate?: boolean;
    shape?: Shape;
    size?: IdsSize;
    colorScheme?: ColorScheme;
    getValueLabel?: (value: number, max: number) => string;
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
    children?: ReactNode;
  };

  type PartProps<E extends 'span' | 'div'> = Omit<ComponentProps<E>, 'className' | 'children'> & {
    asChild?: boolean;
    className?: string | ((state: State) => string | undefined);
    children?: ReactNode;
  };

  export function Label({ asChild, className, id, ...props }: Label.Props) {
    const { state, styles, labelId } = useProgressContext('Progress.Label');
    const Root = asChild ? Slot : 'span';
    return (
      <Root
        {...props}
        id={id ?? labelId}
        data-progress-label=""
        className={styles.label({ className: resolve(className, state) })}
      />
    );
  }
  export namespace Label {
    export type Props = PartProps<'span'>;
  }

  // The progressbar already reports the value, so the visible copy is hidden from screen readers.
  export function Value({ asChild, className, children, ...props }: Value.Props) {
    const { state, styles } = useProgressContext('Progress.Value');
    const Root = asChild ? Slot : 'span';
    const content =
      typeof children === 'function' ? children(state) : (children ?? state.valueLabel ?? '');
    return (
      <Root
        aria-hidden="true"
        {...props}
        data-progress-value=""
        className={styles.value({ className: resolve(className, state) })}
      >
        {content}
      </Root>
    );
  }
  export namespace Value {
    export type Props = Omit<PartProps<'span'>, 'children'> & {
      children?: ReactNode | ((state: State) => ReactNode);
    };
  }

  export function Track({ className, children, ...props }: Track.Props) {
    const { state, styles, progressbar } = useProgressContext('Progress.Track');
    const resolvedClassName = resolve(className, state);
    if (state.shape === 'circular')
      return (
        <circle
          cx="12"
          cy="12"
          r={ARC_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          data-progress-track=""
          className={styles.trackCircle({ className: resolvedClassName })}
        />
      );
    return (
      <div
        {...props}
        {...progressbar}
        data-progress-track=""
        className={styles.track({ className: resolvedClassName })}
      >
        {children ?? <Indicator />}
      </div>
    );
  }
  export namespace Track {
    export type Props = Omit<PartProps<'div'>, 'asChild'>;
  }

  export function Indicator({ asChild, className, style, children, ...props }: Indicator.Props) {
    const { state, styles } = useProgressContext('Progress.Indicator');
    const resolvedClassName = resolve(className, state);
    const ratio = state.percent === null ? null : state.percent / 100;
    if (state.shape === 'circular')
      return (
        <circle
          cx="12"
          cy="12"
          r={ARC_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={ARC_CIRCUMFERENCE}
          strokeDashoffset={ARC_CIRCUMFERENCE * (1 - (ratio ?? 0.25))}
          data-progress-indicator=""
          className={styles.indicatorCircle({ className: resolvedClassName })}
        />
      );
    const Root = asChild ? Slot : 'div';
    return (
      <Root
        {...props}
        data-progress-indicator=""
        className={styles.indicator({ className: resolvedClassName })}
        style={
          { ...(ratio === null ? {} : { '--progress-ratio': ratio }), ...style } as CSSProperties
        }
      >
        {children}
      </Root>
    );
  }
  export namespace Indicator {
    export type Props = PartProps<'div'>;
  }

  export const Style = tv({
    slots: {
      root: '',
      header: 'flex items-baseline gap-2',
      track: 'relative w-full overflow-hidden rounded-full bg-(--ids-color-muted)',
      indicator: 'h-full rounded-full bg-(--progress-fill)',
      circle: 'relative inline-flex shrink-0 items-center justify-center',
      svg: 'size-full',
      trackCircle: 'text-(--ids-color-muted)',
      indicatorCircle: [
        'origin-center -rotate-90 text-(--progress-fill)',
        'transition-[stroke-dashoffset] duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
      ],
      center: 'absolute inset-0 flex items-center justify-center [&_svg]:size-[40%]',
      label: 'min-w-0 truncate text-(--ids-color-on-surface)',
      value: 'shrink-0 text-(--ids-color-on-muted) tabular-nums',
    },
    variants: {
      shape: {
        linear: { root: 'flex w-full flex-col gap-2' },
        circular: { root: 'inline-flex items-center gap-2' },
      } satisfies Record<Shape, object>,
      size: {
        standard: { track: 'h-2', circle: 'size-10', label: 'text-body-b3-medium' },
        tiny: { track: 'h-1', circle: 'size-6', label: 'text-caption-c1-medium' },
      } satisfies Record<IdsSize, object>,
      colorScheme: {
        primary: { root: '[--progress-fill:var(--ids-color-primary)]' },
        neutral: { root: '[--progress-fill:var(--ids-color-on-surface)]' },
        info: { root: '[--progress-fill:var(--ids-color-info)]' },
        success: { root: '[--progress-fill:var(--ids-color-success)]' },
        warning: { root: '[--progress-fill:var(--ids-color-warning)]' },
        danger: { root: '[--progress-fill:var(--ids-color-danger)]' },
      } satisfies Record<ColorScheme, object>,
      indeterminate: {
        // The slide runs the other way in right-to-left text. Reduced motion keeps a still,
        // dimmed full bar rather than a moving one.
        true: {
          indicator: [
            'w-1/4 animate-progress-slide rtl:[animation-direction:reverse]',
            'motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-40',
          ],
          svg: 'animate-spin motion-reduce:animate-none',
        },
        // The bar is full width and slid back by what is missing, so an update moves it on the
        // compositor instead of re-laying out a width. Right-to-left slides it the other way.
        false: {
          indicator: [
            'w-full translate-x-[calc((var(--progress-ratio)-1)*100%)]',
            'rtl:translate-x-[calc((1-var(--progress-ratio))*100%)]',
            'transition-[translate] duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
          ],
        },
      },
    },
    // Beside a bar the value matches the label and keeps to the end of the row, even alone.
    // Inside a 40px ring it has to be caption-sized and centred.
    compoundVariants: [
      { shape: 'linear', size: 'standard', class: { value: 'ms-auto text-body-b3-regular' } },
      { shape: 'linear', size: 'tiny', class: { value: 'ms-auto text-caption-c1-regular' } },
      { shape: 'circular', class: { value: 'text-caption-c2-medium' } },
    ],
    defaultVariants: {
      shape: 'linear',
      size: 'standard',
      colorScheme: 'primary',
      indeterminate: false,
    },
  });
}
