'use client';

import { type ComponentProps } from 'react';

import { useRootContext } from './context';
import { flag } from './step-state';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';

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
  const root = useRootContext('Stepper.Content');
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
