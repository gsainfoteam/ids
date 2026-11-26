'use client';

import { useInternalStepper } from './hooks/use-stepper';
import {
  useInternalStepperRangeWarning,
  useInternalStrayStepWarning,
} from './hooks/use-stepper-warnings';
import { sortSteps } from './lib/steps';
import { StepperContent } from './parts/content';
import { StepperItem } from './parts/item';
import { StepList } from './parts/step-list';
import { stepperStyle } from './style';
import { useInternalRequiredName } from '../../../internal/lib/accessible-name';
import { resolveState } from '../../../internal/lib/state-props';
import { flattenFragments } from '../../../utils';

import type { Stepper } from '.';

export type StepperOrientation = 'horizontal' | 'vertical';

const CONTENT = [StepperContent];

export function StepperRoot(props: Stepper.Props) {
  const {
    value,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    linear = true,
    size = 'standard',
    disabled = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    className,
    style,
    children,
    ...rest
  } = props;

  const { id, listRef, current, interactive, roving, select } = useInternalStepper({
    value,
    defaultValue,
    onValueChange,
    orientation,
    disabled,
  });

  const state: Stepper.State = { value: current, orientation, disabled };
  const { steps, others, strayCount } = sortSteps(
    flattenFragments(resolveState(children, state)),
    StepperItem,
    CONTENT,
  );

  useInternalStepperRangeWarning(current, steps.length);
  useInternalStrayStepWarning('Stepper', 'Stepper.Item and Stepper.Content', strayCount);
  useInternalRequiredName('Stepper', {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  });

  const styles = stepperStyle({ orientation, size, interactive });

  return (
    <StepList
      {...rest}
      context={{
        name: 'Stepper',
        id,
        value: current,
        count: steps.length,
        orientation,
        linear,
        progress: true,
        disabled,
        interactive,
        styles,
        select,
        tabStop: roving.tabStop,
        onTriggerFocus: roving.onItemFocus,
        onTriggerKeyDown: roving.onItemKeyDown,
      }}
      steps={steps}
      others={others}
      listRef={listRef}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-size={size}
      className={styles.root({ className: resolveState(className, state) })}
      style={resolveState(style, state)}
    />
  );
}
