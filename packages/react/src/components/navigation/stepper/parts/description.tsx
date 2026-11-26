'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { Slot } from '../../../utility/slot';
import { useInternalItemContext, useInternalRootContext } from '../context';
import { statusAttributes } from '../lib/step-state';

import type { StepItemState, StepperItemState } from './item';

export type StepperDescriptionState = StepperItemState;

export type StepDescriptionProps<S = StepItemState> = Omit<
  ComponentProps<'span'>,
  'children' | 'className' | 'style'
> &
  StateRenderProps<S> & {
    asChild?: boolean;
  };

export type StepperDescriptionProps = StepDescriptionProps<StepperDescriptionState>;

export function StepDescription({
  asChild,
  className,
  style,
  children,
  ...rest
}: StepDescriptionProps) {
  const root = useInternalRootContext('Description');
  const item = useInternalItemContext('Description');
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

StepDescription.displayName = 'Stepper.Description';

export const StepperDescription = StepDescription as (props: StepperDescriptionProps) => ReactNode;
