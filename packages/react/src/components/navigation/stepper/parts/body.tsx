'use client';

import { useEffect, type ComponentProps } from 'react';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { isDevelopment } from '../../../../utils/dev';
import { Slot } from '../../../utility/slot';
import { useInternalItemContext, useInternalRootContext } from '../context';
import { statusAttributes } from '../lib/step-state';

import type { StepperItemState } from './item';

export type StepperBodyState = StepperItemState;

export type StepperBodyProps = Omit<ComponentProps<'div'>, 'children' | 'className' | 'style'> &
  StateRenderProps<StepperBodyState> & {
    asChild?: boolean;
  };

export function StepperBody({ asChild, className, style, children, ...rest }: StepperBodyProps) {
  const root = useInternalRootContext('Stepper.Body');
  const { state } = useInternalItemContext('Stepper.Body');
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
