import {
  createContext,
  use,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type RefCallback,
} from 'react';

import { percentOf, stepMarks, thumbOffset } from './slider-math';
import { useSlider, type SliderValue } from './use-slider';
import { FormValue } from '../../../internal/form-value';
import { messages } from '../../../internal/messages';
import { sliderSurface } from '../../../internal/slider-surface';
import { invariant, mergeProps, tv } from '../../../utils';
import { Slot } from '../../utility/slot';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type { SliderValue } from './use-slider';
export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderValueLabel = 'auto' | 'always' | 'never';

export type SliderState = {
  value: SliderValue;
  values: readonly number[];
  dragging: boolean;
  orientation: SliderOrientation;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
};

export type SliderThumbState = SliderState & {
  index: number;
  thumbValue: number;
  thumbDragging: boolean;
};

type StateProp<T, S = SliderState> = T | ((state: S) => T);

type SingleProps = {
  selectionMode?: 'single';
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
};

type RangeProps = {
  selectionMode: 'range';
  value?: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  onValueCommit?: (value: [number, number]) => void;
};

type SharedProps = Omit<
  ComponentProps<'div'>,
  'children' | 'className' | 'style' | 'defaultValue' | 'onChange' | 'role'
> & {
  min?: number;
  max?: number;
  step?: number;
  largeStep?: number;
  minStepsBetweenThumbs?: number;
  orientation?: SliderOrientation;
  size?: IdsSize;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  name?: string;
  form?: string;
  marks?: boolean | readonly number[];
  formatLabel?: (value: number) => string;
  valueLabel?: SliderValueLabel;
  thumbLabels?: readonly [string, string];
  className?: StateProp<string | undefined>;
  style?: StateProp<CSSProperties | undefined>;
  children?: ReactNode;
};

export type SliderProps = SharedProps & (SingleProps | RangeProps);

type Context = {
  state: SliderState;
  styles: ReturnType<typeof Slider.Style>;
  min: number;
  max: number;
  range: boolean;
  dragging: number | null;
  formatLabel: ((value: number) => string) | undefined;
  valueLabel: SliderValueLabel;
  setTrack: RefCallback<HTMLElement>;
  thumbProps: (index: number) => Record<string, unknown>;
};

const SliderContext = createContext<Context | null>(null);

function useSliderContext(part: string) {
  const context = use(SliderContext);
  invariant(context, `${part} must be rendered inside Slider.`);
  return context;
}

function resolve<T, S>(value: StateProp<T, S>, state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

function position(orientation: SliderOrientation, offset: string): CSSProperties {
  return orientation === 'vertical' ? { bottom: offset } : { insetInlineStart: offset };
}

export function Slider(props: SliderProps) {
  const {
    selectionMode = 'single',
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    largeStep = step * 10,
    minStepsBetweenThumbs = 0,
    orientation = 'horizontal',
    size,
    disabled = false,
    readOnly = false,
    invalid,
    name,
    form,
    marks = false,
    formatLabel,
    valueLabel = 'auto',
    thumbLabels = [messages.slider.start, messages.slider.end],
    className,
    style,
    children,
    ref,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalidProp,
    ...rest
  } = props;
  const {
    required: _alwaysHasValue,
    'aria-required': _ariaAlwaysHasValue,
    ...domProps
  } = rest as typeof rest & { required?: unknown };

  invariant(min < max, 'Slider: `min` must be less than `max`.');
  invariant(step > 0, 'Slider: `step` must be positive.');
  const range = selectionMode === 'range';
  invariant(
    [value, defaultValue].every(
      (entry) =>
        entry === undefined ||
        (range ? Array.isArray(entry) && entry.length === 2 : typeof entry === 'number'),
    ),
    range
      ? 'Slider: `selectionMode="range"` takes a `[start, end]` value.'
      : 'Slider: a single slider takes a number value.',
  );

  const resolvedSize = useFieldSize(size) ?? 'standard';
  const slider = useSlider({
    range,
    value,
    defaultValue,
    onValueChange: onValueChange as ((value: SliderValue) => void) | undefined,
    onValueCommit: onValueCommit as ((value: SliderValue) => void) | undefined,
    min,
    max,
    step,
    largeStep,
    minStepsBetweenThumbs,
    orientation,
    disabled,
    readOnly,
    ref,
  });
  const { values, dragging, anchorRef, rootRef, setTrack, setThumb, rootHandlers, thumbHandlers } =
    slider;

  const ariaInvalid = ariaInvalidProp ?? invalid;
  const state: SliderState = {
    value: slider.value,
    values,
    dragging: dragging !== null,
    orientation,
    disabled,
    readOnly,
    invalid: ariaInvalid === true || ariaInvalid === 'true',
  };
  const styles = Slider.Style({ orientation, size: resolvedSize });
  const gap = minStepsBetweenThumbs * step;

  const thumbProps = (index: number) => ({
    ref: setThumb(index),
    role: 'slider',
    tabIndex: disabled ? -1 : 0,
    'aria-label': range ? thumbLabels[index] : ariaLabel,
    'aria-labelledby': range ? undefined : ariaLabelledby,
    'aria-describedby': range ? undefined : ariaDescribedby,
    'aria-orientation': orientation,
    'aria-valuemin': range && index === 1 ? values[0]! + gap : min,
    'aria-valuemax': range && index === 0 ? values[1]! - gap : max,
    'aria-valuenow': values[index],
    'aria-valuetext': formatLabel?.(values[index]!),
    'aria-disabled': disabled || undefined,
    'aria-readonly': readOnly || undefined,
    'aria-invalid': ariaInvalid,
    'data-index': index,
    'data-dragging': dragging === index ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
    ...thumbHandlers(index),
  });

  const markValues = Array.isArray(marks)
    ? (marks as readonly number[])
    : marks
      ? stepMarks(min, max, step)
      : [];

  return (
    <SliderContext.Provider
      value={{
        state,
        styles,
        min,
        max,
        range,
        dragging,
        formatLabel,
        valueLabel,
        setTrack,
        thumbProps,
      }}
    >
      <div
        {...mergeProps(domProps, rootHandlers)}
        ref={rootRef}
        tabIndex={-1}
        {...(range
          ? {
              role: 'group',
              'aria-label': ariaLabel,
              'aria-labelledby': ariaLabelledby,
              'aria-describedby': ariaDescribedby,
            }
          : {})}
        data-slider=""
        data-orientation={orientation}
        data-size={resolvedSize}
        data-dragging={dragging !== null ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-invalid={state.invalid ? '' : undefined}
        className={styles.root({ className: resolve(className, state) })}
        style={resolve(style, state)}
      >
        {children ?? <Slider.Track />}
        {markValues.length > 0 && (
          <div aria-hidden="true" className={styles.marks()}>
            {markValues.map((mark) => (
              <span
                key={mark}
                className={styles.mark()}
                style={position(orientation, thumbOffset(percentOf(mark, min, max)))}
              >
                <span className={styles.tick()} />
                {Array.isArray(marks) && (formatLabel?.(mark) ?? String(mark))}
              </span>
            ))}
          </div>
        )}
        <FormValue
          name={name}
          form={form}
          value={values.map(String)}
          disabled={disabled}
          anchor={anchorRef}
        />
      </div>
    </SliderContext.Provider>
  );
}

export namespace Slider {
  export type Props = SliderProps;
  export type State = SliderState;
  export type ThumbState = SliderThumbState;
  export type Value = SliderValue;
  export type Orientation = SliderOrientation;

  type PartProps<S = SliderState> = Omit<
    ComponentProps<'span'>,
    'className' | 'style' | 'children'
  > & {
    asChild?: boolean;
    className?: StateProp<string | undefined, S>;
    style?: StateProp<CSSProperties | undefined, S>;
    children?: ReactNode | ((state: S) => ReactNode);
  };

  export type TrackProps = PartProps;
  export type RangeProps = PartProps;
  export type ThumbProps = PartProps<SliderThumbState> & { index?: number };

  function Part({
    asChild,
    props,
    children,
  }: {
    asChild: boolean | undefined;
    props: Record<string, unknown>;
    children: ReactNode;
  }) {
    return asChild ? <Slot {...props}>{children}</Slot> : <span {...props}>{children}</span>;
  }

  export function Track({ asChild, className, style, children, ...props }: TrackProps) {
    const { state, styles, range, setTrack } = useSliderContext('Slider.Track');
    const content = resolve(children, state) ?? (
      <>
        <Range />
        <Thumb index={0} />
        {range && <Thumb index={1} />}
      </>
    );
    return (
      <Part
        asChild={asChild}
        props={{
          ...props,
          ref: setTrack,
          'data-orientation': state.orientation,
          'data-disabled': state.disabled ? '' : undefined,
          className: styles.track({ className: resolve(className, state) }),
          style: resolve(style, state),
        }}
      >
        {content}
      </Part>
    );
  }

  export namespace Track {
    export type Props = TrackProps;
  }

  export function Range({ asChild, className, style, children, ...props }: RangeProps) {
    const { state, styles, min, max, range } = useSliderContext('Slider.Range');
    const [first, last] = [state.values[0]!, state.values[state.values.length - 1]!];
    const start = range ? thumbOffset(percentOf(first, min, max)) : '0%';
    const end = thumbOffset(percentOf(last, min, max));
    const extent = `calc(${end} - ${start})`;
    const placement: CSSProperties =
      state.orientation === 'vertical'
        ? { bottom: start, height: extent }
        : { insetInlineStart: start, width: extent };
    return (
      <Part
        asChild={asChild}
        props={{
          ...props,
          'aria-hidden': true,
          'data-orientation': state.orientation,
          className: styles.range({ className: resolve(className, state) }),
          style: { ...placement, ...resolve(style, state) },
        }}
      >
        {resolve(children, state)}
      </Part>
    );
  }

  export namespace Range {
    export type Props = RangeProps;
  }

  export function Thumb({ index = 0, asChild, className, style, children, ...props }: ThumbProps) {
    const { state, styles, min, max, dragging, formatLabel, valueLabel, thumbProps } =
      useSliderContext('Slider.Thumb');
    invariant(
      index >= 0 && index < state.values.length,
      `Slider.Thumb: index ${index} has no value; a range slider has thumbs 0 and 1.`,
    );
    const thumbValue = state.values[index]!;
    const thumbState: SliderThumbState = {
      ...state,
      index,
      thumbValue,
      thumbDragging: dragging === index,
    };
    const label =
      valueLabel === 'never' ? null : (
        <span
          aria-hidden="true"
          data-visible={valueLabel === 'always' ? '' : undefined}
          className={styles.valueLabel()}
        >
          {formatLabel?.(thumbValue) ?? thumbValue}
        </span>
      );
    const content = resolve(children, thumbState) ?? label;
    return (
      <Part
        asChild={asChild}
        props={mergeProps(
          {
            ...thumbProps(index),
            className: styles.thumb(),
            style: position(state.orientation, thumbOffset(percentOf(thumbValue, min, max))),
          },
          {
            ...props,
            className: resolve(className, thumbState),
            style: resolve(style, thumbState),
          },
        )}
      >
        {content}
      </Part>
    );
  }

  export namespace Thumb {
    export type Props = ThumbProps;
  }

  export const Style = tv({
    slots: {
      root: [
        'group/slider relative grid select-none outline-none',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
      ],
      track: [sliderSurface.edge, 'relative rounded-full bg-(--ids-color-muted)'],
      range: [
        sliderSurface.edge,
        'absolute rounded-full bg-(--ids-color-primary) group-data-invalid/slider:bg-(--ids-color-danger)',
      ],
      thumb: [
        sliderSurface.thumb,
        'group/thumb absolute block size-(--slider-thumb)',
        'bg-(--ids-color-primary) group-data-invalid/slider:bg-(--ids-color-danger)',
        'transition-shadow duration-(--ids-motion-fast) motion-reduce:transition-none focus-ring',
      ],
      valueLabel: [
        'pointer-events-none absolute rounded-indicator px-1.5 py-0.5 whitespace-nowrap',
        'bg-(--ids-color-on-surface) text-caption-c1-medium text-(--ids-color-surface) tabular-nums',
        'opacity-0 transition-opacity duration-(--ids-motion-fast) motion-reduce:transition-none',
        'group-focus-visible/thumb:opacity-100 group-data-dragging/thumb:opacity-100 data-visible:opacity-100',
      ],
      marks: 'relative text-caption-c2-regular text-(--ids-color-on-muted)',
      mark: 'absolute flex items-center gap-1 whitespace-nowrap',
      tick: 'rounded-full bg-(--ids-color-border)',
    },
    variants: {
      orientation: {
        horizontal: {
          root: 'w-full grid-rows-(--slider-thumb) touch-pan-y items-center',
          track: 'h-(--slider-track) w-full',
          range: 'h-full',
          thumb: 'top-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2',
          valueLabel: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
          marks: 'mt-1 h-5 w-full',
          mark: '-translate-x-1/2 flex-col rtl:translate-x-1/2',
          tick: 'h-1 w-px',
        },
        vertical: {
          root: 'h-full min-h-44 grid-cols-(--slider-thumb) touch-pan-x justify-items-center',
          track: 'h-full w-(--slider-track)',
          range: 'w-full',
          thumb: 'left-1/2 -translate-x-1/2 translate-y-1/2',
          valueLabel: 'start-full top-1/2 ms-2 -translate-y-1/2',
          marks: 'ms-1 h-full w-10',
          mark: 'translate-y-1/2',
          tick: 'h-px w-1',
        },
      } satisfies Record<SliderOrientation, object>,
      size: {
        standard: { root: '[--slider-thumb:1rem] [--slider-track:0.75rem]' },
        tiny: { root: '[--slider-thumb:0.875rem] [--slider-track:0.625rem]' },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { orientation: 'horizontal', size: 'standard' },
  });
}
