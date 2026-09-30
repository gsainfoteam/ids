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
  resize: (size: number) => void;
  reset: () => void;
};

export const RESIZE_STEP = 16;
export const RESIZE_STEP_LARGE = 64;

export const separatorOrientation = (dimension: ResizeDimension): ResizeOrientation =>
  dimension === 'width' ? 'vertical' : 'horizontal';

export function resizeKeyMap<E extends Element>(
  orientation: ResizeOrientation,
  { value, min, max }: ResizeRange,
  resizeTo: (size: number) => void,
  resizeBy: (step: number) => void = (step) => resizeTo(clamp(value + step, min, max)),
): KeyMap<E> {
  const to = (size: number) => () => resizeTo(clamp(size, min, max));
  const by = (step: number) => () => resizeBy(step);
  const toTheEnd = Number.isFinite(max) ? to(max) : undefined;

  if (orientation === 'vertical')
    return {
      ArrowLeft: by(-RESIZE_STEP),
      ArrowRight: by(RESIZE_STEP),
      'Shift+ArrowLeft': by(-RESIZE_STEP_LARGE),
      'Shift+ArrowRight': by(RESIZE_STEP_LARGE),
      Home: to(min),
      End: toTheEnd,
    };

  return {
    ArrowUp: by(-RESIZE_STEP),
    ArrowDown: by(RESIZE_STEP),
    'Shift+ArrowUp': by(-RESIZE_STEP_LARGE),
    'Shift+ArrowDown': by(RESIZE_STEP_LARGE),
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
      valueText: value === undefined ? undefined : t('resizable.value', { value }),
      controls: axis.controls,
      disabled,
    }),
    'aria-label': t(`resizable.${axis.dimension}`),
  };
}
