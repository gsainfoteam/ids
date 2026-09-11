import { useRef, useState } from 'react';
import type { ComponentProps, KeyboardEvent, PointerEvent } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { invariant, tv } from '../../utils';

import type { IdsSize } from '../../tokens/types';

function decimalsOf(n: number) {
  const [mantissa, exponent] = String(n).split('e');
  const fraction = mantissa!.split('.')[1]?.length ?? 0;
  return fraction + (exponent == null ? 0 : Math.max(0, -Number(exponent)));
}

function snap(raw: number, min: number, max: number, step: number) {
  const stepped = Math.round((raw - min) / step) * step + min;
  // step 의 자릿수만 쓰면 min 0.25 / step 0.5 에서 0.25 가 0.3 으로 잘린다.
  const decimals = Math.min(100, Math.max(decimalsOf(min), decimalsOf(max), decimalsOf(step)));
  return Number(Math.min(max, Math.max(min, stepped)).toFixed(decimals));
}

export function Slider({
  selectionMode = 'single',
  orientation = 'horizontal',
  size = 'standard',
  min = 0,
  max = 100,
  step = 1,
  largeStep = step * 10,
  marks = false,
  thumbLabels = ['시작', '끝'],
  formatLabel = String,
  disabled = false,
  value: valueProp,
  defaultValue,
  onChange,
  className,
  ...rest
}: Slider.Props) {
  invariant(min < max, '`<Slider>` `min` must be less than `max`.');
  invariant(step > 0, '`<Slider>` `step` must be positive.');

  const range = selectionMode === 'range';
  const fallback: Slider.Value = range ? [min, max] : min;
  const [value, setValue] = useControllableState<Slider.Value>({
    value: valueProp,
    defaultValue: defaultValue ?? fallback,
    onChange: onChange as ((next: Slider.Value) => void) | undefined,
  });

  const inBounds = (n: unknown) =>
    typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;

  invariant(
    !range ||
      (Array.isArray(value) &&
        value.length === 2 &&
        value.every(inBounds) &&
        value[0]! <= value[1]!),
    `\`<Slider>\` in range mode needs a \`[start, end]\` value inside [${min}, ${max}] with \`start <= end\`.`,
  );
  invariant(
    range || inBounds(value),
    `\`<Slider>\` in single mode needs a finite number inside [${min}, ${max}].`,
  );

  const values = Array.isArray(value) ? value : [value];
  const trackRef = useRef<HTMLSpanElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  function commit(index: number, next: number) {
    const bounded = snap(next, min, max, step);
    if (!range) {
      setValue(bounded);
      return;
    }
    const [start, end] = values;
    setValue(index === 0 ? [Math.min(bounded, end), end] : [start, Math.max(bounded, start)]);
  }

  function valueAt(event: PointerEvent<HTMLSpanElement>) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect == null) return min;
    const ratio =
      orientation === 'vertical'
        ? (rect.bottom - event.clientY) / rect.height
        : (event.clientX - rect.left) / rect.width;
    return min + Math.min(1, Math.max(0, ratio)) * (max - min);
  }

  function nearestIndex(next: number) {
    if (!range) return 0;
    return Math.abs(next - values[0]) <= Math.abs(next - values[1]) ? 0 : 1;
  }

  function onPointerDown(event: PointerEvent<HTMLSpanElement>) {
    if (disabled) return;
    const next = valueAt(event);
    const index = nearestIndex(next);
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(index);
    commit(index, next);
  }

  function onPointerMove(event: PointerEvent<HTMLSpanElement>) {
    if (dragging == null) return;
    commit(dragging, valueAt(event));
  }

  function onKeyDown(index: number) {
    return (event: KeyboardEvent<HTMLSpanElement>) => {
      if (disabled) return;
      const amount = event.shiftKey ? largeStep : step;
      const forward = orientation === 'vertical' ? 'ArrowUp' : 'ArrowRight';
      const backward = orientation === 'vertical' ? 'ArrowDown' : 'ArrowLeft';

      const next = {
        [forward]: values[index] + amount,
        [backward]: values[index] - amount,
        PageUp: values[index] + largeStep,
        PageDown: values[index] - largeStep,
        Home: min,
        End: max,
      }[event.key];

      if (next == null) return;
      event.preventDefault();
      commit(index, next);
    };
  }

  const markValues = Array.isArray(marks)
    ? marks
    : marks
      ? Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step)
      : [];

  const ratio = (item: number) => ((item - min) / (max - min)) * 100;
  const offset = (percent: number) =>
    orientation === 'vertical' ? { bottom: `${percent}%` } : { left: `${percent}%` };

  const start = range ? ratio(values[0]) : 0;
  const end = ratio(range ? values[1] : values[0]);

  const { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...rootProps } = rest;

  // 단일 모드의 래퍼는 thumb 하나만 감싸므로 group 으로 묶을 것이 없다. 이름은 thumb 으로 간다.
  const { root, track, rangeBar, thumb, marksRoot, mark } = Slider.Style({
    orientation,
    size,
    disabled,
  });

  return (
    <span
      {...rootProps}
      {...(range
        ? { role: 'group' as const, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy }
        : {})}
      className={root({ className })}
    >
      <span
        ref={trackRef}
        className={track()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(null)}
        onPointerCancel={() => setDragging(null)}
      >
        <span
          className={rangeBar()}
          style={
            orientation === 'vertical'
              ? { bottom: `${start}%`, height: `${end - start}%` }
              : { left: `${start}%`, width: `${end - start}%` }
          }
        />
        {values.map((item, index) => (
          <span
            key={index}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-orientation={orientation}
            {...(range
              ? { 'aria-label': thumbLabels[index] }
              : { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy })}
            aria-valuemin={range && index === 1 ? values[0] : min}
            aria-valuemax={range && index === 0 ? values[1] : max}
            aria-valuenow={item}
            aria-valuetext={formatLabel(item)}
            aria-disabled={disabled || undefined}
            className={thumb()}
            style={offset(ratio(item))}
            onKeyDown={onKeyDown(index)}
          />
        ))}
      </span>
      {markValues.length > 0 ? (
        <span aria-hidden className={marksRoot()}>
          {markValues.map((item) => (
            <span key={item} className={mark()} style={offset(ratio(item))}>
              {formatLabel(item)}
            </span>
          ))}
        </span>
      ) : null}
    </span>
  );
}

export namespace Slider {
  export const Style = tv({
    slots: {
      root: 'relative inline-flex touch-none select-none',
      track: 'relative rounded-full bg-(--ids-color-muted)',
      rangeBar: 'absolute rounded-full bg-(--ids-color-primary)',
      thumb: [
        'absolute rounded-full bg-(--ids-color-surface) shadow-sm',
        'inset-ring-2 inset-ring-(--ids-color-primary)',
        'transition-[box-shadow] motion-reduce:transition-none',
        'focus-ring',
      ],
      marksRoot: 'relative',
      mark: 'absolute text-caption-c2-regular text-(--ids-color-on-muted)',
    },
    variants: {
      orientation: {
        horizontal: {
          root: 'w-full flex-col',
          track: 'h-1.5 w-full',
          rangeBar: 'h-full',
          thumb: 'top-1/2 -translate-x-1/2 -translate-y-1/2',
          marksRoot: 'mt-2 h-4 w-full',
          mark: '-translate-x-1/2',
        },
        vertical: {
          root: 'h-full flex-row',
          track: 'h-full w-1.5',
          rangeBar: 'w-full',
          thumb: 'left-1/2 translate-x-[-50%] translate-y-1/2',
          marksRoot: 'ml-2 h-full w-8',
          mark: 'translate-y-1/2',
        },
      },
      size: {
        standard: { thumb: 'size-4.5' },
        tiny: { thumb: 'size-3.5' },
      } satisfies Record<IdsSize, { thumb: string }>,
      disabled: {
        true: { root: 'pointer-events-none opacity-50' },
        false: { track: 'cursor-pointer' },
      },
    },
    defaultVariants: { orientation: 'horizontal', size: 'standard', disabled: false },
  });

  export type Value = number | [number, number];

  export type Props = Omit<
    ComponentProps<'span'>,
    'children' | 'className' | 'role' | 'onChange' | 'defaultValue'
  > & {
    selectionMode?: 'single' | 'range';
    orientation?: 'horizontal' | 'vertical';
    size?: IdsSize;
    min?: number;
    max?: number;
    step?: number;
    largeStep?: number;
    marks?: boolean | number[];
    thumbLabels?: [string, string];
    formatLabel?: (value: number) => string;
    disabled?: boolean;
    value?: Value;
    defaultValue?: Value;
    onChange?: (value: Value) => void;
    className?: string;
  };
}
