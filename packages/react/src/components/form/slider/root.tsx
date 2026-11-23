'use client';

import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { SliderContext } from './context';
import { useInternalSlider, type SliderValue } from './hooks/use-slider';
import { useInternalSliderValueShape } from './hooks/use-slider-value-shape';
import { resolve, type StateProp } from './lib/state-prop';
import { SliderTrack } from './parts/track';
import { sliderStyle } from './style';
import { FormValue } from '../../../internal/parts/form-value';
import { useInternalTranslate } from '../../../internal/translate';
import { containsElementOfType, invariant, mergeProps } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type SliderOrientation = 'horizontal' | 'vertical';

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

export type SliderProps<V extends SliderValue = SliderValue> = Omit<
  ComponentProps<'div'>,
  'children' | 'className' | 'style' | 'defaultValue' | 'onChange' | 'role'
> & {
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  onValueCommit?: (value: V) => void;
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
  formatLabel?: (value: number) => string;
  className?: StateProp<string | undefined>;
  style?: StateProp<CSSProperties | undefined>;
  children?: ReactNode;
};

const TRACK = new Set<unknown>([SliderTrack]);

export function SliderRoot<V extends SliderValue>(props: SliderProps<V>) {
  const t = useInternalTranslate();

  const {
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
    formatLabel,
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
  const range = useInternalSliderValueShape(value ?? defaultValue);

  const resolvedSize = useFieldSize(size) ?? 'standard';
  const slider = useInternalSlider({
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
    'aria-label': range ? t(index === 0 ? 'slider.start' : 'slider.end') : ariaLabel,
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

  return (
    <SliderContext.Provider
      value={{
        state,
        styles,
        min,
        max,
        step,
        range,
        dragging,
        formatLabel,
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
        {!containsElementOfType(children, TRACK) && <SliderTrack />}
        {children}
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
