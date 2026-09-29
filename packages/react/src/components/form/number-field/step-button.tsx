import { type ComponentProps } from 'react';

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

import { useNumberContext } from './context';
import { mergeProps } from '../../../utils';
import { IconButton } from '../../action/icon-button';

export type NumberFieldStepProps = Omit<ComponentProps<'button'>, 'children'>;

type StepButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  direction: 1 | -1;
  stacked?: boolean;
};

export function StepButton({ direction, stacked = false, className, ...props }: StepButtonProps) {
  const { field, state, incrementLabel, decrementLabel, styles } = useNumberContext(
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
      aria-label={props['aria-label'] ?? (direction > 0 ? incrementLabel : decrementLabel)}
      aria-controls={field.inputProps.id}
      disabled={blocked || props.disabled}
      data-number-field-step={direction > 0 ? 'increment' : 'decrement'}
      icon={icon}
      className={stacked ? styles.stepButton({ className }) : styles.action({ className })}
    />
  );
}
