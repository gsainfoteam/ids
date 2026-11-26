'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { Slot } from '../../../utility/slot';
import { useInternalItemContext, useInternalRootContext } from '../context';
import { useInternalStepperBodyWarning } from '../hooks/use-stepper-body-warning';
import { statusAttributes } from '../lib/step-state';

import type { StepItemState, StepperItemState } from './item';

export type StepperBodyState = StepperItemState;

export type StepBodyProps<S = StepItemState> = Omit<
  ComponentProps<'div'>,
  'children' | 'className' | 'style'
> &
  StateRenderProps<S> & {
    asChild?: boolean;
  };

export type StepperBodyProps = StepBodyProps<StepperBodyState>;

export function StepBody({ asChild, className, style, children, ...rest }: StepBodyProps) {
  const root = useInternalRootContext('Body');
  const { state } = useInternalItemContext('Body');
  useInternalStepperBodyWarning(root.name, root.orientation === 'horizontal');

  const props = {
    ...rest,
    'data-stepper-body': '',
    ...statusAttributes(state.status),
    className: root.styles.body({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  };
  const content = resolveState(children, state);

  if (asChild === true) return <Slot {...props}>{content}</Slot>;
  return <div {...props}>{content}</div>;
}

StepBody.displayName = 'Stepper.Body';

export const StepperBody = StepBody as (props: StepperBodyProps) => ReactNode;
