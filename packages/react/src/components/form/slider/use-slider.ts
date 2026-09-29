'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
  type RefCallback,
} from 'react';

import { clamp, isEqual } from 'es-toolkit';
import { flushSync } from 'react-dom';

import { closestThumb, moveThumb, ratioAlong } from './slider-math';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { keyHandler, withModifiers } from '../../../internal/keys';
import { mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

export type SliderValue = number | [number, number];

export type UseSliderOptions = {
  range: boolean;
  value?: SliderValue;
  defaultValue?: SliderValue;
  onValueChange?: (value: SliderValue) => void;
  onValueCommit?: (value: SliderValue) => void;
  min: number;
  max: number;
  step: number;
  largeStep: number;
  minStepsBetweenThumbs: number;
  orientation: 'horizontal' | 'vertical';
  disabled: boolean;
  readOnly: boolean;
  ref?: Ref<HTMLDivElement>;
};

type Drag = { index: number; tied: boolean; from: readonly number[]; pointerId: number };

function tryCapturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture?.(pointerId);
    return true;
  } catch {
    return false;
  }
}

function keepFocusOnThumb(event: PointerEvent<HTMLDivElement>) {
  event.preventDefault();
}

function toArray(value: SliderValue | undefined) {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? [value] : [...value];
}

export function useSlider({
  range,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min,
  max,
  step,
  largeStep,
  minStepsBetweenThumbs,
  orientation,
  disabled,
  readOnly,
  ref,
}: UseSliderOptions) {
  const output = (values: readonly number[]): SliderValue =>
    range ? [values[0]!, values[1]!] : values[0]!;
  const initial = toArray(defaultValue) ?? (range ? [min, max] : [min]);
  const [stored, setStored] = useControllableState<readonly number[]>({
    value: toArray(value),
    defaultValue: initial,
    onValueChange: (next) => onValueChange?.(output(next)),
  });
  const controlled = value !== undefined;

  const values = [...stored]
    .map((entry) => clamp(Number.isFinite(entry) ? entry : min, min, max))
    .sort((a, b) => a - b);
  useEffect(() => {
    if (isDevelopment && !isEqual(values, stored))
      console.warn(
        `[IDS] Slider: value ${JSON.stringify(stored)} is out of order or outside [${min}, ${max}].`,
      );
  });

  const bounds = { min, max, step, gap: minStepsBetweenThumbs * step };
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLElement | null>(null);
  const thumbRefs = useRef<Array<HTMLElement | null>>([]);
  const latest = useRef(values);
  useLayoutEffect(() => {
    latest.current = values;
  });
  const drag = useRef<Drag | null>(null);
  const valuesBeforeHeldKey = useRef<readonly number[] | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const commit = (from: readonly number[]) => {
    if (!isEqual(from, latest.current)) onValueCommit?.(output(latest.current));
  };

  const renderBeforeNextMove = (next: readonly number[]) => {
    flushSync(() => setStored(next));
  };

  const isRtl = () => {
    const root = rootRef.current;
    return (
      orientation === 'horizontal' && root !== null && getComputedStyle(root).direction === 'rtl'
    );
  };

  const drawnThumbLength = (vertical: boolean) => {
    const box = thumbRefs.current[0]?.getBoundingClientRect();
    return (vertical ? box?.height : box?.width) ?? 0;
  };

  const valueAt = (event: PointerEvent<HTMLElement>) => {
    const root = rootRef.current;
    const track = trackRef.current ?? root;
    if (!root || !track) return null;
    const rect = track.getBoundingClientRect();
    const vertical = orientation === 'vertical';
    const thumb = drawnThumbLength(vertical);
    const length = vertical ? rect.height : rect.width;
    const distance = vertical
      ? rect.bottom - event.clientY
      : isRtl()
        ? rect.right - event.clientX
        : event.clientX - rect.left;
    return min + ratioAlong(distance, length, thumb) * (max - min);
  };

  const focusThumb = (index: number) => thumbRefs.current[index]?.focus({ preventScroll: true });

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    const raw = valueAt(event);
    if (raw === null) return;
    keepFocusOnThumb(event);
    const { index, tied } = closestThumb(latest.current, raw);
    focusThumb(index);
    if (readOnly) return;
    tryCapturePointer(event.currentTarget, event.pointerId);
    drag.current = { index, tied, from: latest.current, pointerId: event.pointerId };
    setDragging(index);
    if (!tied) renderBeforeNextMove(moveThumb(latest.current, index, raw, bounds));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const raw = valueAt(event);
    if (raw === null) return;
    if (active.tied) {
      const stackedAt = latest.current[active.index]!;
      if (raw === stackedAt) return;
      active.index =
        raw < stackedAt ? latest.current.indexOf(stackedAt) : latest.current.lastIndexOf(stackedAt);
      active.tied = false;
      setDragging(active.index);
      focusThumb(active.index);
    }
    renderBeforeNextMove(moveThumb(latest.current, active.index, raw, bounds));
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    drag.current = null;
    setDragging(null);
    commit(active.from);
  };

  const onThumbKeyDown = (index: number) => (event: KeyboardEvent<HTMLElement>) => {
    if (disabled || readOnly) return;

    const at = latest.current[index]!;
    const small = event.shiftKey ? largeStep : step;
    const moveTo = (target: number) => () => {
      valuesBeforeHeldKey.current ??= latest.current;
      renderBeforeNextMove(moveThumb(latest.current, index, target, bounds));
    };

    keyHandler(
      withModifiers({
        ArrowUp: moveTo(at + small),
        ArrowDown: moveTo(at - small),
        ArrowRight: moveTo(at + small),
        ArrowLeft: moveTo(at - small),
        PageUp: moveTo(at + largeStep),
        PageDown: moveTo(at - largeStep),
        Home: moveTo(min),
        End: moveTo(max),
      }),
      { dir: isRtl() ? 'rtl' : 'ltr' },
    )(event);
  };

  const commitHeldKey = () => {
    const from = valuesBeforeHeldKey.current;
    if (!from) return;
    valuesBeforeHeldKey.current = null;
    commit(from);
  };

  useFormReset(rootRef, () => {
    if (!controlled) setStored(initial, { silent: true });
  });

  const forwardRootFocusToThumb = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) focusThumb(0);
  };

  const mergedRootRef: RefCallback<HTMLDivElement> = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(rootRef, ref)(node),
    [ref],
  );
  const setTrack: RefCallback<HTMLElement> = useCallback((node: HTMLElement | null) => {
    trackRef.current = node;
  }, []);
  const setThumb = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      thumbRefs.current[index] = node;
    },
    [],
  );

  return {
    values,
    value: output(values),
    dragging,
    anchorRef: rootRef,
    rootRef: mergedRootRef,
    setTrack,
    setThumb,
    rootHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onLostPointerCapture: onPointerEnd,
      onFocus: forwardRootFocusToThumb,
    },
    thumbHandlers: (index: number) => ({
      onKeyDown: onThumbKeyDown(index),
      onKeyUp: commitHeldKey,
      onBlur: commitHeldKey,
    }),
  };
}
