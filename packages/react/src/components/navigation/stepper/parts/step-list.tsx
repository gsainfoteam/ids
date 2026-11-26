'use client';

import { type ComponentProps, type ReactElement, type ReactNode, type Ref } from 'react';

import { StepperContext, StepperIndexContext, type StepsContextValue } from '../context';
import { flag } from '../lib/step-state';

type StepListProps = Omit<ComponentProps<'div'>, 'children'> & {
  context: StepsContextValue;
  steps: ReactElement[];
  others: ReactNode[];
  listRef?: Ref<HTMLOListElement>;
};

export function StepList({
  context,
  steps,
  others,
  listRef,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: StepListProps) {
  return (
    <StepperContext value={context}>
      <div
        {...rest}
        data-stepper=""
        data-orientation={context.orientation}
        data-disabled={flag(context.disabled)}
      >
        <ol
          ref={listRef}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={context.styles.list()}
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
