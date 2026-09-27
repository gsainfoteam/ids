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

  // Out-of-range or unordered values are drawn clamped and in order rather than thrown on, since a
  // controlled value can pass through such a state while its parent is still updating.
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
  const keyFrom = useRef<readonly number[] | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const commit = (from: readonly number[]) => {
    if (!isEqual(from, latest.current)) onValueCommit?.(output(latest.current));
  };

  // A drag reports on every pointer move. Each move is rendered at once so the next move measures
  // from what is on screen, not from a state update still waiting to render.
  const moveTo = (next: readonly number[]) => {
    flushSync(() => setStored(next));
  };

  const isRtl = () => {
    const root = rootRef.current;
    return (
      orientation === 'horizontal' && root !== null && getComputedStyle(root).direction === 'rtl'
    );
  };

  const valueAt = (event: PointerEvent<HTMLElement>) => {
    const root = rootRef.current;
    const track = trackRef.current ?? root;
    if (!root || !track) return null;
    const rect = track.getBoundingClientRect();
    const thumb = parseFloat(getComputedStyle(root).getPropertyValue('--slider-thumb')) || 0;
    const vertical = orientation === 'vertical';
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
    // The root is focusable for `ref.focus()`, and the mousedown that follows would focus it and
    // take focus away from the thumb being dragged. Cancelling here stops that mousedown.
    event.preventDefault();
    const { index, tied } = closestThumb(latest.current, raw);
    focusThumb(index);
    if (readOnly) return;
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // A synthetic pointer (a test, a replay tool) is not an active pointer and cannot be
      // captured; the drag still works while the pointer stays over the slider.
    }
    drag.current = { index, tied, from: latest.current, pointerId: event.pointerId };
    setDragging(index);
    if (!tied) moveTo(moveThumb(latest.current, index, raw, bounds));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const raw = valueAt(event);
    if (raw === null) return;
    // Stacked thumbs are told apart by the first move: the one that can go that way follows.
    if (active.tied) {
      const at = latest.current[active.index]!;
      if (raw === at) return;
      active.index = raw < at ? latest.current.indexOf(at) : latest.current.lastIndexOf(at);
      active.tied = false;
      setDragging(active.index);
      focusThumb(active.index);
    }
    moveTo(moveThumb(latest.current, active.index, raw, bounds));
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
    const forward = isRtl() ? -small : small;
    const targets: Record<string, number> = {
      ArrowUp: at + small,
      ArrowDown: at - small,
      ArrowRight: at + forward,
      ArrowLeft: at - forward,
      PageUp: at + largeStep,
      PageDown: at - largeStep,
      Home: min,
      End: max,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    keyFrom.current ??= latest.current;
    moveTo(moveThumb(latest.current, index, target, bounds));
  };

  // A held key repeats, so the value is committed once the key is released, or when focus leaves
  // before that happens.
  const settleKeys = () => {
    const from = keyFrom.current;
    if (!from) return;
    keyFrom.current = null;
    commit(from);
  };

  useFormReset(rootRef, () => {
    if (!controlled) setStored(initial, { silent: true });
  });

  // `ref` and a Field label's id point at the root; focus belongs on a thumb.
  const focusFirstThumb = (event: FocusEvent<HTMLDivElement>) => {
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
      onFocus: focusFirstThumb,
    },
    thumbHandlers: (index: number) => ({
      onKeyDown: onThumbKeyDown(index),
      onKeyUp: settleKeys,
      onBlur: settleKeys,
    }),
  };
}
