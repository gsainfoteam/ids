'use client';

import { StepperContext, StepperIndexContext } from './context';
import { useInternalStepper } from './hooks/use-stepper';
import { useInternalStepperWarnings } from './hooks/use-stepper-warnings';
import { flag } from './lib/step-state';
import { isStep, isStray } from './lib/steps';
import { stepperStyle } from './style';
import { useInternalRequiredName } from '../../../internal/lib/accessible-name';
import { resolveState } from '../../../internal/lib/state-props';
import { flattenFragments } from '../../../utils';

import type { Stepper } from '.';

export type StepperOrientation = 'horizontal' | 'vertical';

export function StepperRoot(props: Stepper.Props) {
  const {
    value,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    linear = true,
    progress = true,
    size = 'standard',
    disabled = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    className,
    style,
    children,
    ...rest
  } = props;

  const { id, listRef, current, interactive, shownValue, roving, select } = useInternalStepper({
    value,
    defaultValue,
    onValueChange,
    orientation,
    progress,
    disabled,
  });

  const state: Stepper.State = { value: shownValue, orientation, disabled, progress };
  const nodes = flattenFragments(resolveState(children, state));
  const steps = nodes.filter(isStep);
  const others = nodes.filter((node) => !isStep(node));
  const count = steps.length;
  useInternalStepperWarnings({
    props,
    progress,
    current,
    count,
    strayCount: others.filter(isStray).length,
  });

  useInternalRequiredName('Stepper', {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  });

  const styles = stepperStyle({ orientation, size, interactive, progress });

  return (
    <StepperContext
      value={{
        id,
        value: shownValue,
        count,
        orientation,
        linear,
        progress,
        disabled,
        interactive,
        styles,
        select,
        tabStop: roving.tabStop,
        onTriggerFocus: roving.onItemFocus,
        onTriggerKeyDown: roving.onItemKeyDown,
      }}
    >
      <div
        {...rest}
        data-stepper=""
        data-orientation={orientation}
        data-size={size}
        data-disabled={flag(disabled)}
        className={styles.root({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        <ol
          ref={listRef}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={styles.list()}
        >
          {steps.map((step, index) => (
            <StepperIndexContext key={step.key ?? index} value={index}>
              {step}
            </StepperIndexContext>
          ))}
        </ol>
        {others}
      </div>
    </StepperContext>
  );
}
