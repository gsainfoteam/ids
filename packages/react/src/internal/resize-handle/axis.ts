import { clamp } from 'es-toolkit';

import type { KeyMap } from '../keys';
import type { Translate } from '../translate';

export type ResizeDimension = 'width' | 'height';

export type ResizeOrientation = 'horizontal' | 'vertical';

export type ResizeRange = { value: number; min: number; max: number };

export type ResizeAxis = {
  dimension: ResizeDimension;
  target: HTMLElement | null;
  size: number | undefined;
  min: number;
  max: number;
  controls?: string;
  step?: number;
  valueLabel?: (size: number) => string;
  resize: (size: number) => void;
  reset: () => void;
};

export const RESIZE_STEP = 16;
export const RESIZE_STEP_LARGE = 64;

const STEPS_IN_A_LARGE_STEP = 4;
const ON_THE_GRID = 1e-6;

export const snapToStep = (size: number, step: number | undefined) =>
  step ? Math.round(size / step) * step : Math.round(size);

const stepsAway = (value: number, steps: number, step: number) =>
  steps > 0
    ? (Math.floor(value / step + ON_THE_GRID) + steps) * step
    : (Math.ceil(value / step - ON_THE_GRID) + steps) * step;

export const separatorOrientation = (dimension: ResizeDimension): ResizeOrientation =>
  dimension === 'width' ? 'vertical' : 'horizontal';

export function resizeKeyMap<E extends Element>(
  orientation: ResizeOrientation,
  { value, min, max }: ResizeRange,
  resizeTo: (size: number) => void,
  resizeBy: (step: number) => void = (step) => resizeTo(clamp(value + step, min, max)),
  gridStep?: number,
): KeyMap<E> {
  const to = (size: number) => () => resizeTo(clamp(size, min, max));
  const by = (steps: number) =>
    gridStep ? to(stepsAway(value, steps, gridStep)) : () => resizeBy(steps * RESIZE_STEP);
  const toTheEnd = Number.isFinite(max) ? to(max) : undefined;
  const large = gridStep ? STEPS_IN_A_LARGE_STEP : RESIZE_STEP_LARGE / RESIZE_STEP;

  if (orientation === 'vertical')
    return {
      ArrowLeft: by(-1),
      ArrowRight: by(1),
      'Shift+ArrowLeft': by(-large),
      'Shift+ArrowRight': by(large),
      Home: to(min),
      End: toTheEnd,
    };

  return {
    ArrowUp: by(-1),
    ArrowDown: by(1),
    'Shift+ArrowUp': by(-large),
    'Shift+ArrowDown': by(large),
    Home: to(min),
    End: toTheEnd,
  };
}

export type SeparatorOptions = {
  orientation: ResizeOrientation;
  value: number | undefined;
  min: number;
  max: number;
  valueText?: string;
  controls?: string;
  disabled?: boolean;
};

export function separatorProps({
  orientation,
  value,
  min,
  max,
  valueText,
  controls,
  disabled = false,
}: SeparatorOptions) {
  return {
    role: 'separator',
    tabIndex: disabled ? undefined : 0,
    'aria-orientation': orientation,
    'aria-valuenow': value,
    'aria-valuemin': min,
    'aria-valuemax': Number.isFinite(max) ? max : undefined,
    'aria-valuetext': valueText,
    'aria-controls': controls,
    'aria-disabled': disabled || undefined,
    'data-resize-handle': '',
    'data-disabled': disabled ? '' : undefined,
  } as const;
}

export function axisSeparatorProps(axis: ResizeAxis, t: Translate, disabled: boolean) {
  const value = axis.size === undefined ? undefined : Math.round(axis.size);

  return {
    ...separatorProps({
      orientation: separatorOrientation(axis.dimension),
      value,
      min: Math.round(axis.min),
      max: Number.isFinite(axis.max) ? Math.round(axis.max) : axis.max,
      valueText:
        value === undefined
          ? undefined
          : (axis.valueLabel?.(value) ?? t('resizable.value', { value })),
      controls: axis.controls,
      disabled,
    }),
    'aria-label': t(`resizable.${axis.dimension}`),
  };
}
