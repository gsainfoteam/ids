'use client';

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';

import { clamp, isEqual } from 'es-toolkit';
import { flushSync } from 'react-dom';

import {
  axisSeparatorProps,
  resizeKeyMap,
  separatorOrientation,
  snapToStep,
  type ResizeAxis,
  type ResizeDimension,
  type ResizeRange,
} from './axis';
import {
  endEndCornerExponent,
  innerEndEndRadius,
  isBeingDragged,
  isRightToLeft,
  markDragged,
  measureAxis,
  type MeasuredAxis,
} from './measure';
import { useResizeDrag, type ResizeDelta } from './use-resize-drag';
import { keyHandler, type KeyMap } from '../keys';
import { useIntlWords, useTranslate } from '../translate';

type Started = {
  dimension: ResizeDimension;
  step: number | undefined;
  element: HTMLElement;
  before: string;
  written: string;
  range: ResizeRange;
};

export type MeasuredAxes = Partial<Record<ResizeDimension, MeasuredAxis>>;

export type AxesDragOptions = {
  disabled: boolean;
  onDraggingChange?: (dragging: boolean) => void;
};

const along = (dimension: ResizeDimension, delta: ResizeDelta) =>
  dimension === 'width' ? delta.inline : delta.block;

export function currentRange(axis: ResizeAxis): ResizeRange | null {
  if (!axis.target) return null;

  const drawn = measureAxis(axis.target, axis.dimension);
  return {
    value: drawn.size,
    min: Math.max(axis.min, drawn.min),
    max: Math.min(axis.max, drawn.max),
  };
}

export const readingDirection = (element: Element) =>
  ({ dir: isRightToLeft(element) ? 'rtl' : 'ltr' }) as const;

export function axisKeyMap<E extends Element>(
  axis: ResizeAxis,
  resizeTo: (size: number) => void = axis.resize,
): KeyMap<E> {
  const range = currentRange(axis);
  return range
    ? resizeKeyMap<E>(separatorOrientation(axis.dimension), range, resizeTo, undefined, axis.step)
    : {};
}

export function useMeasuredAxes(targets: Partial<Record<ResizeDimension, HTMLElement | null>>) {
  const [measured, setMeasured] = useState<MeasuredAxes>({});
  const { width, height } = targets;

  useLayoutEffect(() => {
    const observed = (
      [
        ['width', width],
        ['height', height],
      ] as const
    ).flatMap(([dimension, element]) => (element ? [[dimension, element] as const] : []));
    const first = observed[0];
    if (!first) return;

    const read = () => {
      if (observed.some(([, element]) => isBeingDragged(element))) return;

      const next: MeasuredAxes = Object.fromEntries(
        observed.map(([dimension, element]) => [dimension, measureAxis(element, dimension)]),
      );
      setMeasured((previous) => (isEqual(previous, next) ? previous : next));
    };

    const observer = new first[1].ownerDocument.defaultView!.ResizeObserver(read);
    for (const [, element] of observed) observer.observe(element);
    read();

    return () => observer.disconnect();
  }, [width, height]);

  return measured;
}

export type CornerShape = { radius: number; exponent: number };

const cornerShapeOf = (element: HTMLElement): CornerShape => ({
  radius: innerEndEndRadius(element),
  exponent: endEndCornerExponent(element),
});

const keepingAnEqualShape = (next: CornerShape) => (previous: CornerShape | null) =>
  isEqual(previous, next) ? previous : next;

export function useCornerShape(corner: HTMLElement | null) {
  const [shape, setShape] = useState<CornerShape | null>(null);

  useLayoutEffect(() => {
    if (!corner) return;

    const read = () => setShape(keepingAnEqualShape(cornerShapeOf(corner)));
    const observer = new corner.ownerDocument.defaultView!.ResizeObserver(read);
    observer.observe(corner);
    read();

    return () => observer.disconnect();
  }, [corner]);

  useLayoutEffect(() => {
    const readAfterARestyleThatKeptTheSize = () => {
      if (corner) setShape(keepingAnEqualShape(cornerShapeOf(corner)));
    };
    readAfterARestyleThatKeptTheSize();
  });

  return shape;
}

export function useAxesDrag(
  axes: readonly ResizeAxis[],
  { disabled, onDraggingChange }: AxesDragOptions,
) {
  const started = useRef<Started[]>([]);

  const sizeAt = ({ dimension, step, range }: Started, delta: ResizeDelta) =>
    clamp(snapToStep(range.value + along(dimension, delta), step), range.min, range.max);

  const write = (entry: Started, value: string) => {
    if (entry.written === value) return;
    entry.written = value;
    entry.element.style.setProperty(entry.dimension, value);
  };

  const restore = () => {
    for (const entry of started.current) write(entry, entry.before);
    markDragged(
      started.current.map((entry) => entry.element),
      false,
    );
  };

  const resizeTo = (sizes: ReadonlyArray<readonly [ResizeDimension, number]>) => {
    flushSync(() => {
      for (const [dimension, size] of sizes)
        axes.find((axis) => axis.dimension === dimension)?.resize(size);
    });
  };

  return useResizeDrag({
    axes: axes.length > 1 ? 'both' : axes[0]?.dimension === 'height' ? 'block' : 'inline',
    disabled,
    onStart: () => {
      started.current = axes.flatMap((axis) => {
        const range = currentRange(axis);
        if (!axis.target || !range) return [];

        const before = axis.target.style.getPropertyValue(axis.dimension);
        return [
          {
            dimension: axis.dimension,
            step: axis.step,
            element: axis.target,
            before,
            written: before,
            range,
          },
        ];
      });
      markDragged(
        started.current.map((entry) => entry.element),
        true,
      );
    },
    onMove: (delta) => {
      for (const entry of started.current) write(entry, `${sizeAt(entry, delta)}px`);
    },
    onEnd: (delta) => {
      const sizes = started.current.map(
        (entry) => [entry.dimension, sizeAt(entry, delta)] as const,
      );
      restore();
      resizeTo(sizes);
    },
    onCancel: restore,
    onReset: () => {
      for (const axis of axes) axis.reset();
    },
    onDraggingChange,
  });
}

export function useAxisSeparator(axis: ResizeAxis, options: AxesDragOptions) {
  const t = useTranslate();
  const words = useIntlWords();
  const drag = useAxesDrag([axis], options);

  return {
    ...axisSeparatorProps(axis, t, words, options.disabled),
    ...drag.dragProps,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (options.disabled) return;
      keyHandler(
        { ...axisKeyMap(axis), Enter: axis.reset },
        readingDirection(event.currentTarget),
      )(event);
    },
  };
}
