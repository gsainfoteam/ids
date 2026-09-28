import {
  isValidElement,
  useId,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { StarIcon } from '@heroicons/react/24/solid';

import { useRating } from './use-rating';
import { flattenParts } from '../../../internal/field-popup';
import { FormValue } from '../../../internal/form-value';
import { messages } from '../../../internal/messages';
import { invariant, tv } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type RatingState = {
  value: number;
  previewValue: number | null;
  interactive: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
};

export type RatingItemState = RatingState & {
  index: number;
  itemValue: number;
  fill: 'full' | 'half' | 'empty';
};

type StateProp<T, S> = T | ((state: S) => T);

type RatingOptionPlacement = 'zero' | 'whole' | 'start' | 'end';

export type RatingProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'className' | 'style' | 'children' | 'role'
> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onHover?: (value: number | null) => void;
  max?: number;
  step?: 1 | 0.5;
  size?: IdsSize;
  selectionMode?: 'single' | 'none';
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  requiredMessage?: string;
  name?: string;
  form?: string;
  getValueLabel?: (value: number, max: number) => string;
  className?: StateProp<string | undefined, RatingState>;
  style?: StateProp<CSSProperties | undefined, RatingState>;
  children?: ReactNode;
};

type ItemProps = {
  index?: number;
  className?: StateProp<string | undefined, RatingItemState>;
  style?: StateProp<CSSProperties | undefined, RatingItemState>;
  children?: ReactNode | ((state: RatingItemState) => ReactNode);
};

function RatingItem(_props: ItemProps): ReactNode {
  invariant(false, 'Rating.Item must be a direct child of Rating (or inside a Fragment).');
}

function resolve<T, S>(value: StateProp<T, S>, state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

export function Rating({
  value,
  defaultValue = 0,
  onValueChange,
  onHover,
  max = 5,
  step = 1,
  size,
  selectionMode = 'single',
  disabled = false,
  readOnly = false,
  invalid,
  required = false,
  requiredMessage = messages.rating.required,
  name,
  form,
  getValueLabel = messages.rating.valueLabel,
  className,
  style,
  children,
  ref,
  id,
  onKeyDown,
  onBlur,
  onFocus,
  onPointerLeave,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalidProp,
  'aria-required': ariaRequired,
  ...rest
}: RatingProps) {
  invariant(Number.isInteger(max) && max > 0, 'Rating: max must be a positive integer.');
  invariant(step === 1 || step === 0.5, 'Rating: step must be 1 or 0.5.');

  let template: ReactElement<ItemProps> | undefined;
  const indexed = new Map<number, ReactElement<ItemProps>>();
  for (const child of flattenParts(children)) {
    invariant(
      isValidElement<ItemProps>(child) && child.type === RatingItem,
      'Rating children must be Rating.Item elements.',
    );
    const { index } = child.props;
    if (index === undefined) {
      invariant(template === undefined, 'Rating takes one Rating.Item without an index.');
      template = child;
      continue;
    }
    invariant(
      Number.isInteger(index) && index >= 0 && index < max && !indexed.has(index),
      'Rating.Item index must be unique and between 0 and max - 1.',
    );
    indexed.set(index, child);
  }

  const displayOnly = selectionMode === 'none';
  const interactive = !displayOnly && !disabled && !readOnly;
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const rating = useRating({
    value,
    defaultValue,
    onValueChange,
    onHover,
    max,
    step,
    interactive,
    ref,
  });
  const {
    current,
    hover,
    displayed,
    anchorRef,
    rootRef,
    preview,
    choose,
    forwardRootFocusToChecked,
  } = rating;
  const ariaInvalid = ariaInvalidProp ?? invalid;
  const state: RatingState = {
    value: current,
    previewValue: hover,
    interactive,
    disabled,
    readOnly,
    required,
    invalid: ariaInvalid === true || ariaInvalid === 'true',
  };
  const styles = Rating.Style({ size: resolvedSize });
  const scoreLabel = getValueLabel(current, max);
  const generatedId = useId();
  const scoreId = `${id ?? generatedId}-score`;

  const option = (score: number, placement: RatingOptionPlacement) => (
    <button
      key={score}
      type="button"
      role="radio"
      data-rating-value={score}
      data-field-input=""
      aria-label={getValueLabel(score, max)}
      aria-checked={score === current}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      aria-disabled={readOnly || undefined}
      disabled={disabled}
      tabIndex={!disabled && score === current ? 0 : -1}
      className={styles.option({ placement })}
      onClick={() => {
        choose(score);
        preview(null);
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') preview(score);
      }}
    />
  );

  return (
    <div
      {...rest}
      ref={rootRef}
      id={id}
      role={displayOnly ? 'img' : 'radiogroup'}
      tabIndex={displayOnly ? undefined : -1}
      aria-label={
        displayOnly
          ? ariaLabel
            ? `${ariaLabel}: ${scoreLabel}`
            : scoreLabel
          : (ariaLabel ?? (ariaLabelledby ? undefined : messages.rating.label))
      }
      aria-labelledby={
        displayOnly && ariaLabelledby ? `${ariaLabelledby} ${scoreId}` : ariaLabelledby
      }
      aria-required={displayOnly ? undefined : (ariaRequired ?? (required || undefined))}
      aria-readonly={!displayOnly && readOnly ? true : undefined}
      aria-disabled={disabled || undefined}
      aria-invalid={displayOnly ? undefined : ariaInvalid}
      data-rating=""
      data-size={resolvedSize}
      data-disabled={disabled ? '' : undefined}
      data-readonly={readOnly ? '' : undefined}
      data-required={required ? '' : undefined}
      data-invalid={state.invalid ? '' : undefined}
      data-previewing={hover === null ? undefined : ''}
      className={styles.root({ className: resolve(className, state) })}
      style={resolve(style, state)}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        preview(null);
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        preview(null);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        forwardRootFocusToChecked(event);
        onFocus?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) rating.onKeyDown(event);
      }}
    >
      {!displayOnly && option(0, 'zero')}
      {Array.from({ length: max }, (_, index) => {
        const item = (indexed.get(index) ?? template)?.props;
        const fill = Math.min(1, Math.max(0, displayed - index));
        const itemState: RatingItemState = {
          ...state,
          index,
          itemValue: index + 1,
          fill: fill === 1 ? 'full' : fill === 0 ? 'empty' : 'half',
        };
        const graphic = resolve(item?.children, itemState) ?? <StarIcon />;
        return (
          <span
            key={index}
            data-rating-item=""
            data-state={itemState.fill}
            className={styles.item({ className: resolve(item?.className, itemState) })}
            style={resolve(item?.style, itemState)}
          >
            <span aria-hidden="true" inert className={styles.graphic()}>
              <span className={styles.empty()}>{graphic}</span>
              <span
                className={styles.fill()}
                style={{ '--rating-fill': `${fill * 100}%` } as CSSProperties}
              >
                {graphic}
              </span>
            </span>
            {!displayOnly &&
              (step === 0.5 ? (
                <>
                  {option(index + 0.5, 'start')}
                  {option(index + 1, 'end')}
                </>
              ) : (
                option(index + 1, 'whole')
              ))}
          </span>
        );
      })}
      {displayOnly ? (
        <span id={scoreId} className="sr-only">
          {scoreLabel}
        </span>
      ) : (
        <FormValue
          name={name}
          form={form}
          value={current > 0 ? String(current) : null}
          required={required && !readOnly}
          disabled={disabled}
          anchor={anchorRef}
          message={requiredMessage}
        />
      )}
    </div>
  );
}

export namespace Rating {
  export type Props = RatingProps;
  export type State = RatingState;
  export type ItemState = RatingItemState;
  export const Item = RatingItem;

  export namespace Item {
    export type Props = ItemProps;
  }

  export const Style = tv({
    slots: {
      root: [
        'relative inline-flex max-w-full flex-wrap rounded-standard outline-none',
        '[--rating-accent:var(--ids-color-primary)]',
        'data-invalid:[--rating-accent:var(--ids-color-danger)]',
        'has-[[data-rating-value="0"]:focus-visible]:ring-[3px] has-[[data-rating-value="0"]:focus-visible]:ring-(--ids-color-primary)/40',
        'data-disabled:opacity-50',
      ],
      item: 'relative inline-flex shrink-0 items-center justify-center rounded-standard focus-ring',
      graphic: 'pointer-events-none relative block [&_svg]:size-full',
      empty:
        'absolute inset-0 text-(--ids-color-border) in-data-invalid:text-(--ids-color-danger)/35',
      fill: [
        'absolute inset-0 text-(--rating-accent)',
        '[clip-path:inset(0_calc(100%-var(--rating-fill))_0_0)]',
        'rtl:[clip-path:inset(0_0_0_calc(100%-var(--rating-fill)))]',
      ],
      option:
        'absolute inset-y-0 cursor-pointer touch-manipulation rounded-standard outline-none disabled:cursor-not-allowed',
    },
    variants: {
      size: {
        standard: {
          root: 'gap-1',
          item: 'size-(--ids-size-control-standard)',
          graphic: 'size-7',
        },
        tiny: {
          root: 'gap-0.5',
          item: 'size-(--ids-size-control-tiny)',
          graphic: 'size-5',
        },
      } satisfies Record<IdsSize, object>,
      placement: {
        zero: { option: 'sr-only' },
        whole: { option: 'inset-x-0' },
        start: { option: 'start-0 w-1/2' },
        end: { option: 'end-0 w-1/2' },
      } satisfies Record<RatingOptionPlacement, object>,
    },
    defaultVariants: { size: 'standard' },
  });
}
