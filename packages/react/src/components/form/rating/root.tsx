'use client';

import {
  isValidElement,
  useId,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { StarIcon } from '@heroicons/react/24/solid';

import { isCheckedScore, useInternalRating } from './hooks/use-rating';
import { resolve, type StateProp } from './lib/state-prop';
import { RatingItem, type RatingItemProps } from './parts/item';
import { ratingStyle, type RatingOptionPlacement } from './style';
import { hasAccessibleName, useInternalUnnamedWarning } from '../../../internal/lib/accessible-name';
import { FormValue } from '../../../internal/parts/form-value';
import { useInternalTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments, invariant } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

const NO_FORM_OWNER = '';

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
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  getValueLabel?: (value: number, max: number) => string;
  className?: StateProp<string | undefined, RatingState>;
  style?: StateProp<CSSProperties | undefined, RatingState>;
  children?: ReactNode;
};

export function RatingRoot({
  value,
  defaultValue = 0,
  onValueChange,
  onHover,
  max = 5,
  step = 1,
  size,
  disabled = false,
  readOnly = false,
  invalid,
  required = false,
  name,
  form,
  getValueLabel: getValueLabelProp,
  className,
  style,
  children,
  ref,
  id,
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
  const t = useInternalTranslate();
  const getValueLabel =
    getValueLabelProp ?? ((value: number, max: number) => t('rating.valueLabel', { value, max }));

  invariant(Number.isInteger(max) && max > 0, 'Rating: max must be a positive integer.');
  invariant(step === 1 || step === 0.5, 'Rating: step must be 1 or 0.5.');

  let template: ReactElement<RatingItemProps> | undefined;
  const indexed = new Map<number, ReactElement<RatingItemProps>>();
  for (const child of flattenFragments(children)) {
    invariant(
      isValidElement<RatingItemProps>(child) && elementTypeOf(child) === RatingItem,
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

  const interactive = !readOnly && !disabled;
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const rating = useInternalRating({
    value,
    defaultValue,
    onValueChange,
    onHover,
    max,
    step,
    interactive,
    missingMessage: null,
    ref,
  });
  const {
    current,
    hover,
    displayed,
    rootRef,
    anchorRef,
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
  const styles = ratingStyle({ size: resolvedSize });
  const scoreLabel = getValueLabel(current, max);
  const generatedId = useId();
  const scoreId = `${id ?? generatedId}-score`;
  const groupName = name ?? generatedId;
  const formOwner = name === undefined && form === undefined ? NO_FORM_OWNER : form;
  useInternalUnnamedWarning(
    'Rating',
    !readOnly && !hasAccessibleName({ 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby }),
  );

  const option = (score: number, placement: RatingOptionPlacement) => (
    <input
      key={score}
      type="radio"
      name={groupName}
      form={formOwner}
      value={score}
      checked={isCheckedScore(score, current)}
      tabIndex={score === current ? 0 : -1}
      required={required && interactive}
      disabled={disabled}
      data-rating-value={score}
      data-field-input=""
      aria-label={getValueLabel(score, max)}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      className={styles.option({ placement })}
      onChange={() => {
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
      role={readOnly ? 'img' : 'radiogroup'}
      tabIndex={readOnly ? undefined : -1}
      aria-label={readOnly ? (ariaLabel ? `${ariaLabel}: ${scoreLabel}` : scoreLabel) : ariaLabel}
      aria-labelledby={readOnly && ariaLabelledby ? `${ariaLabelledby} ${scoreId}` : ariaLabelledby}
      aria-required={readOnly ? undefined : (ariaRequired ?? (required || undefined))}
      aria-disabled={disabled || undefined}
      aria-invalid={readOnly ? undefined : ariaInvalid}
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
    >
      {!readOnly && option(0, 'zero')}
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
            {!readOnly &&
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
      {readOnly && (
        <span id={scoreId} className="sr-only">
          {scoreLabel}
        </span>
      )}
      {readOnly && current > 0 && (
        <FormValue
          name={name}
          form={form}
          value={String(current)}
          disabled={disabled}
          anchor={anchorRef}
        />
      )}
    </div>
  );
}
