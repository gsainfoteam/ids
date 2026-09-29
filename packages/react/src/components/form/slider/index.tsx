'use client';

import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { SliderContext } from './context';
import { SliderRange, type SliderRangeProps } from './range';
import { percentOf, position, stepMarks, thumbOffset } from './slider-math';
import { resolve, type StateProp } from './state-prop';
import { sliderStyle } from './style';
import { SliderThumb, type SliderThumbProps } from './thumb';
import { SliderTrack, type SliderTrackProps } from './track';
import { useSlider, type SliderValue } from './use-slider';
import { FormValue } from '../../../internal/form-value';
import { messages } from '../../../internal/messages';
import { invariant, mergeProps } from '../../../utils';
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
  const styles = sliderStyle({ orientation, size: resolvedSize });
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
        {children ?? <SliderTrack />}
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

  export type TrackProps = SliderTrackProps;
  export type RangeProps = SliderRangeProps;
  export type ThumbProps = SliderThumbProps;

  export const Track = SliderTrack;
  export namespace Track {
    export type Props = TrackProps;
  }

  export const Range = SliderRange;
  export namespace Range {
    export type Props = RangeProps;
  }

  export const Thumb = SliderThumb;
  export namespace Thumb {
    export type Props = ThumbProps;
  }

  export const Style = sliderStyle;
}
