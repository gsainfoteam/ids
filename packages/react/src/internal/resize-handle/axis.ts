import { clamp } from 'es-toolkit';

import type { KeyMap } from '../keys';

export type ResizeDimension = 'width' | 'height';

export type ResizeOrientation = 'horizontal' | 'vertical';

export type ResizeRange = { value: number; min: number; max: number };

export const RESIZE_STEP = 16;
export const RESIZE_STEP_LARGE = 64;

export const separatorOrientation = (dimension: ResizeDimension): ResizeOrientation =>
  dimension === 'width' ? 'vertical' : 'horizontal';

export function resizeKeyMap<E extends Element>(
  orientation: ResizeOrientation,
  { value, min, max }: ResizeRange,
  resizeTo: (size: number) => void,
): KeyMap<E> {
  const to = (size: number) => () => resizeTo(clamp(size, min, max));
  const toTheEnd = Number.isFinite(max) ? to(max) : undefined;

  if (orientation === 'vertical')
    return {
      ArrowLeft: to(value - RESIZE_STEP),
      ArrowRight: to(value + RESIZE_STEP),
      'Shift+ArrowLeft': to(value - RESIZE_STEP_LARGE),
      'Shift+ArrowRight': to(value + RESIZE_STEP_LARGE),
      Home: to(min),
      End: toTheEnd,
    };

  return {
    ArrowUp: to(value - RESIZE_STEP),
    ArrowDown: to(value + RESIZE_STEP),
    'Shift+ArrowUp': to(value - RESIZE_STEP_LARGE),
    'Shift+ArrowDown': to(value + RESIZE_STEP_LARGE),
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
