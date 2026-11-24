'use client';

import { type ComponentProps } from 'react';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { Slot } from '../../../utility/slot';
import { useInternalItemContext, useInternalRootContext } from '../context';
import { statusAttributes } from '../lib/step-state';

import type { StepperItemState } from './item';

export type StepperDescriptionState = StepperItemState;

export type StepperDescriptionProps = Omit<
  ComponentProps<'span'>,
  'children' | 'className' | 'style'
> &
  StateRenderProps<StepperDescriptionState> & {
    asChild?: boolean;
  };

export function StepperDescription({
  asChild,
  className,
  style,
  children,
  ...rest
}: StepperDescriptionProps) {
  const root = useInternalRootContext('Stepper.Description');
  const item = useInternalItemContext('Stepper.Description');
  const { state } = item;
  const props = {
    id: item.ids.description,
    ...rest,
    'data-stepper-description': '',
    ...statusAttributes(state.status),
    className: root.styles.description({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  };
  const content = resolveState(children, state);

  if (asChild === true) return <Slot {...props}>{content}</Slot>;
  return <span {...props}>{content}</span>;
}

StepperDescription.displayName = 'Stepper.Description';
