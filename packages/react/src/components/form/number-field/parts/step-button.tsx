'use client';

import { use, type ComponentProps } from 'react';

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

import { useInternalTranslate } from '../../../../internal/translate';
import { mergeProps } from '../../../../utils';
import { IconButton } from '../../../action/icon-button';
import { InsideStepperContext, useInternalNumberContext } from '../context';

export type NumberFieldStepProps = Omit<ComponentProps<'button'>, 'children'>;

type StepButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  direction: 1 | -1;
};

export function StepButton({ direction, className, ...props }: StepButtonProps) {
  const t = useInternalTranslate();
  const stacked = use(InsideStepperContext);
  const { field, state, styles } = useInternalNumberContext(
    direction > 0 ? 'Increment' : 'Decrement',
  );
  const blocked =
    state.disabled || state.readOnly || !(direction > 0 ? field.canIncrease : field.canDecrease);
  const icon = stacked ? (
    direction > 0 ? (
      <ChevronUpIcon aria-hidden="true" />
    ) : (
      <ChevronDownIcon aria-hidden="true" />
    )
  ) : direction > 0 ? (
    <PlusIcon aria-hidden="true" />
  ) : (
    <MinusIcon aria-hidden="true" />
  );
  return (
    <IconButton
      {...mergeProps(props, field.stepperProps(direction))}
      type="button"
      tabIndex={-1}
      variant="ghost"
      size={state.size}
      aria-label={
        props['aria-label'] ?? t(direction > 0 ? 'numberField.increment' : 'numberField.decrement')
      }
      aria-controls={field.inputProps.id}
      disabled={blocked || props.disabled}
      data-number-field-step={direction > 0 ? 'increment' : 'decrement'}
      icon={icon}
      className={stacked ? styles.stepButton({ className }) : styles.action({ className })}
    />
  );
}
