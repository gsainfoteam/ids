'use client';

import { useEffect, type ComponentProps } from 'react';

import { useItemContext, useRootContext } from './context';
import { statusAttributes } from './step-state';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { isDevelopment } from '../../../utils/dev';
import { Slot } from '../../utility/slot';

import type { StepperItemState } from './item';

export type StepperBodyState = StepperItemState;

export type StepperBodyProps = Omit<ComponentProps<'div'>, 'children' | 'className' | 'style'> &
  StateRenderProps<StepperBodyState> & {
    asChild?: boolean;
  };

export function StepperBody({ asChild, className, style, children, ...rest }: StepperBodyProps) {
  const root = useRootContext('Stepper.Body');
  const { state } = useItemContext('Stepper.Body');
  const hasNoRoomBesideTheSteps = root.orientation === 'horizontal';

  useEffect(() => {
    if (isDevelopment && hasNoRoomBesideTheSteps)
      console.warn(
        '[IDS] Stepper: Stepper.Body is hidden in a horizontal Stepper, where the steps sit side by side. Use orientation="vertical", or show the content outside the Stepper.',
      );
  }, [hasNoRoomBesideTheSteps]);

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

StepperBody.displayName = 'Stepper.Body';
