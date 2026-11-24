'use client';

import { type ComponentProps } from 'react';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { useInternalRootContext } from '../context';
import { flag } from '../lib/step-state';

export type StepperContentState = { value: number; current: boolean };

export type StepperContentProps = Omit<
  ComponentProps<'div'>,
  'children' | 'className' | 'style' | 'hidden'
> &
  StateRenderProps<StepperContentState> & {
    value: number;
  };

export function StepperContent({
  value,
  className,
  style,
  children,
  ...rest
}: StepperContentProps) {
  const root = useInternalRootContext('Stepper.Content');
  const current = value === root.value;
  const state: StepperContentState = { value, current };

  return (
    <div
      {...rest}
      hidden={!current}
      data-stepper-content=""
      data-current={flag(current)}
      className={root.styles.content({ className: resolveState(className, state) })}
      style={resolveState(style, state)}
    >
      {resolveState(children, state)}
    </div>
  );
}

StepperContent.displayName = 'Stepper.Content';
