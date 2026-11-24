'use client';

import { type ComponentProps } from 'react';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { Slot } from '../../../utility/slot';
import { useInternalItemContext, useInternalRootContext } from '../context';
import { statusAttributes } from '../lib/step-state';

import type { StepperItemState } from './item';

export type StepperTitleState = StepperItemState;

export type StepperTitleProps = Omit<ComponentProps<'span'>, 'children' | 'className' | 'style'> &
  StateRenderProps<StepperTitleState> & {
    asChild?: boolean;
  };

export function StepperTitle({ asChild, className, style, children, ...rest }: StepperTitleProps) {
  const root = useInternalRootContext('Stepper.Title');
  const item = useInternalItemContext('Stepper.Title');
  const { state } = item;
  const props = {
    id: item.ids.title,
    ...rest,
    'data-stepper-title': '',
    ...statusAttributes(state.status),
    className: root.styles.title({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  };
  const content = resolveState(children, state);

  if (asChild === true) return <Slot {...props}>{content}</Slot>;
  return <span {...props}>{content}</span>;
}

StepperTitle.displayName = 'Stepper.Title';
