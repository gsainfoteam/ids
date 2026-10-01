'use client';

import { type ComponentProps } from 'react';

import { useItemContext, useRootContext } from './context';
import { statusAttributes } from './step-state';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { Slot } from '../../utility/slot';

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
  const root = useRootContext('Stepper.Description');
  const item = useItemContext('Stepper.Description');
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
