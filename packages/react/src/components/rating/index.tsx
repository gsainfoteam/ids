import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { HeartIcon, StarIcon } from '@heroicons/react/24/solid';

import { invariant, tv } from '../../utils';
import { useFieldSize } from '../field/context';
import { flattenParts } from '../field-popup';

import type { IdsSize } from '../../tokens/types';

export type RatingProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'onHover' | 'ref'
> & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onHover?: (value: number | null) => void;
  max?: number;
  step?: 1 | 0.5;
  variant?: 'star' | 'heart' | 'circle' | 'custom';
  size?: IdsSize;
  selectionMode?: 'single' | 'none';
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  ref?: Ref<HTMLButtonElement>;
  getValueLabel?: (value: number, max: number) => string;
};
type ItemProps = { index: number; children?: ReactNode; asChild?: boolean; className?: string };
function RatingItem(_props: ItemProps): ReactNode {
  invariant(false, 'Rating.Item must be a direct child of Rating (or inside a Fragment).');
}
const defaultLabel = (value: number, max: number) => `${max}점 만점에 ${value}점`;

export function Rating({
  value,
  defaultValue = 0,
  onChange,
  onHover,
  max = 5,
  step = 1,
  variant = 'star',
  size,
  selectionMode = 'single',
  disabled = false,
  readOnly = false,
  invalid,
  required,
  name,
  form,
  ref,
  children,
  className,
  id,
  getValueLabel = defaultLabel,
  onKeyDown,
  onBlur,
  onPointerLeave,
  ...rest
}: RatingProps) {
  invariant(Number.isInteger(max) && max > 0, 'Rating: max must be a positive integer.');
  invariant(step === 1 || step === 0.5, 'Rating: step must be 1 or 0.5.');
  const normalize = (score: number) =>
    Math.round(Math.min(max, Math.max(0, Number.isFinite(score) ? score : 0)) / step) * step;
  const [internal, setInternal] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const raw = value ?? internal;
  const current = normalize(raw);
  const displayOnly = selectionMode === 'none';
  const blocked = displayOnly || disabled || readOnly;
  const displayed = blocked ? current : (hover ?? current);
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const generated = useId();
  const controlId = id ?? `ids-rating-${generated}`;
  const group = useRef<HTMLDivElement>(null);
  const hidden = useRef<HTMLInputElement>(null);
  const parts = flattenParts(children);
  const explicit = new Map<number, ReactElement<ItemProps>>();
  for (const child of parts) {
    invariant(
      isValidElement<ItemProps>(child) && child.type === RatingItem,
      'Rating children must be Rating.Item elements.',
    );
    invariant(
      Number.isInteger(child.props.index) &&
        child.props.index >= 0 &&
        child.props.index < max &&
        !explicit.has(child.props.index),
      'Rating.Item index must be unique and between 0 and max - 1.',
    );
    explicit.set(child.props.index, child);
  }
  invariant(
    variant !== 'custom' || explicit.size === max,
    'Rating custom variant requires one Rating.Item per index.',
  );
  useEffect(() => {
    if (import.meta.env.DEV && (!Number.isFinite(raw) || raw < 0 || raw > max))
      console.warn('[IDS] Rating: value must be between 0 and max.');
  }, [raw, max]);
  useLayoutEffect(() => {
    const owner = hidden.current?.form;
    if (!owner) return;
    let active = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (active && !event.defaultPrevented) {
          if (value === undefined) setInternal(defaultValue);
          setHover(null);
        }
      });
    owner.addEventListener('reset', reset);
    return () => {
      active = false;
      owner.removeEventListener('reset', reset);
    };
  }, [defaultValue, value, form]);
  const preview = (next: number | null) => {
    if (blocked || next === hover) return;
    setHover(next);
    onHover?.(next);
  };
  const choose = (next: number) => {
    if (blocked) return;
    next = normalize(next);
    if (value === undefined) setInternal(next);
    if (next !== current) onChange?.(next);
  };
  const radio = (score: number, extraClass: string) => (
    <button
      key={score}
      type="button"
      role="radio"
      data-rating-value={score}
      id={score === current ? controlId : undefined}
      ref={score === current ? ref : undefined}
      aria-label={getValueLabel(score, max)}
      aria-checked={score === current}
      aria-describedby={rest['aria-describedby']}
      aria-invalid={rest['aria-invalid'] ?? invalid}
      aria-disabled={readOnly || undefined}
      disabled={disabled}
      tabIndex={!disabled && score === current ? 0 : -1}
      className={`touch-manipulation rounded-lg outline-none ${extraClass}`}
      onClick={() => {
        choose(score);
        preview(null);
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') preview(score);
      }}
    />
  );
  const Icon = variant === 'heart' ? HeartIcon : StarIcon;
  const scoreLabel = getValueLabel(current, max);
  return (
    <div
      {...rest}
      ref={group}
      id={displayOnly ? controlId : `${controlId}-group`}
      role={displayOnly ? 'img' : 'radiogroup'}
      aria-label={
        displayOnly
          ? rest['aria-label']
            ? `${rest['aria-label']}: ${scoreLabel}`
            : scoreLabel
          : (rest['aria-label'] ?? (rest['aria-labelledby'] ? undefined : '평점'))
      }
      aria-labelledby={
        displayOnly && rest['aria-labelledby']
          ? `${rest['aria-labelledby']} ${controlId}-score`
          : rest['aria-labelledby']
      }
      aria-required={displayOnly ? undefined : (rest['aria-required'] ?? required)}
      aria-readonly={!displayOnly && readOnly ? true : undefined}
      aria-disabled={disabled || undefined}
      aria-invalid={rest['aria-invalid'] ?? invalid}
      data-rating=""
      data-size={resolvedSize}
      data-disabled={disabled ? '' : undefined}
      className={Rating.Style({ size: resolvedSize, className })}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        preview(null);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          preview(null);
          onBlur?.(event);
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || blocked || event.altKey || event.ctrlKey || event.metaKey)
          return;
        const target = event.target as HTMLElement;
        const at = Number(target.getAttribute('data-rating-value') ?? current);
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        let next: number | undefined;
        if (event.key === 'ArrowRight') next = at + (rtl ? -step : step);
        if (event.key === 'ArrowLeft') next = at + (rtl ? step : -step);
        if (event.key === 'ArrowUp') next = at + step;
        if (event.key === 'ArrowDown') next = at - step;
        if (event.key === 'Home' || event.key === '0') next = 0;
        if (event.key === 'End') next = max;
        if (/^[1-9]$/.test(event.key)) next = Number(event.key);
        if (next === undefined) return;
        event.preventDefault();
        next = normalize(next);
        choose(next);
        preview(null);
        group.current
          ?.querySelector<HTMLButtonElement>(`[data-rating-value="${next}"]`)
          ?.focus({ preventScroll: true });
      }}
    >
      {!displayOnly && radio(0, 'sr-only')}
      {Array.from({ length: max }, (_, index) => {
        const item = explicit.get(index)?.props;
        let graphic =
          item?.children ??
          (variant === 'circle' ? (
            <span className="block size-full rounded-full bg-current" />
          ) : (
            <Icon />
          ));
        if (item?.asChild) {
          invariant(
            isValidElement<ComponentProps<'span'>>(graphic),
            'Rating.Item asChild requires one decorative element.',
          );
          graphic = cloneElement(graphic, { 'aria-hidden': true });
        }
        const fill = Math.min(1, Math.max(0, displayed - index));
        return (
          <span
            key={index}
            data-rating-item=""
            data-state={fill === 1 ? 'full' : fill === 0 ? 'empty' : 'half'}
            className={`relative inline-flex shrink-0 items-center justify-center rounded-lg has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--ids-color-primary) ${resolvedSize === 'tiny' ? 'size-8' : 'size-11'} ${item?.className ?? ''}`}
          >
            <span
              aria-hidden="true"
              inert
              className={`pointer-events-none relative block [&_svg]:size-full ${resolvedSize === 'tiny' ? 'size-5' : 'size-7'}`}
            >
              <span className="absolute inset-0 text-(--ids-color-outline)">{graphic}</span>
              <span
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - fill * 100}% 0 0)` }}
              >
                {graphic}
              </span>
            </span>
            {!displayOnly &&
              (step === 0.5 ? (
                <>
                  {radio(index + 0.5, 'absolute inset-y-0 left-0 w-1/2')}
                  {radio(index + 1, 'absolute inset-y-0 right-0 w-1/2')}
                </>
              ) : (
                radio(index + 1, 'absolute inset-0 w-full')
              ))}
          </span>
        );
      })}
      {displayOnly && (
        <span id={`${controlId}-score`} className="sr-only">
          {scoreLabel}
        </span>
      )}
      <input
        ref={hidden}
        type="hidden"
        name={name}
        value={current}
        disabled={disabled}
        form={form}
      />
    </div>
  );
}
export namespace Rating {
  export type Props = RatingProps;
  export const Item = RatingItem;
  export const Style = tv({
    base: 'relative inline-flex max-w-full flex-wrap gap-1 rounded-xl text-(--ids-rating-color,var(--ids-color-primary)) has-[[data-rating-value="0"]:focus-visible]:outline-2 has-[[data-rating-value="0"]:focus-visible]:outline-offset-2 has-[[data-rating-value="0"]:focus-visible]:outline-(--ids-color-primary) data-disabled:opacity-40',
    variants: { size: { standard: '', tiny: 'gap-0.5' } },
  });
}
