'use client';

import { type ComponentProps } from 'react';

import { useItemContext, useRootContext } from './context';
import { statusAttributes } from './step-state';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';

import type { StepperItemState } from './item';

export type StepperSeparatorState = StepperItemState;

export type StepperSeparatorProps = Omit<
  ComponentProps<'div'>,
  'children' | 'className' | 'style'
> &
  StateRenderProps<StepperSeparatorState>;

export function StepperSeparator({ className, style, children, ...rest }: StepperSeparatorProps) {
  const root = useRootContext('Stepper.Separator');
  const { state } = useItemContext('Stepper.Separator');

  return (
    <div
      aria-hidden
      {...rest}
      data-stepper-separator=""
      {...statusAttributes(state.status)}
      className={root.styles.separator({ className: resolveState(className, state) })}
      style={resolveState(style, state)}
    >
      {resolveState(children, state)}
    </div>
  );
}

StepperSeparator.displayName = 'Stepper.Separator';
