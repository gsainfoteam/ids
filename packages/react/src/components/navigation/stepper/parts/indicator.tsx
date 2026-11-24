'use client';

import { type ComponentProps } from 'react';

import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { Slot } from '../../../utility/slot';
import { useInternalItemContext, useInternalRootContext } from '../context';
import { statusAttributes } from '../lib/step-state';

import type { StepperItemState } from './item';

export type StepperIndicatorState = StepperItemState;

export type StepperIndicatorProps = Omit<
  ComponentProps<'span'>,
  'children' | 'className' | 'style'
> &
  StateRenderProps<StepperIndicatorState> & {
    asChild?: boolean;
  };

const EMPTY_SO_THE_STYLE_DRAWS_A_DOT = null;

function defaultGlyph(state: StepperIndicatorState) {
  if (state.status === 'completed') return <CheckIcon />;
  if (state.status === 'error') return <XMarkIcon />;
  if (state.status === 'neutral') return EMPTY_SO_THE_STYLE_DRAWS_A_DOT;
  return state.index + 1;
}

export function StepperIndicator({
  asChild,
  className,
  style,
  children,
  ...rest
}: StepperIndicatorProps) {
  const root = useInternalRootContext('Stepper.Indicator');
  const { state } = useInternalItemContext('Stepper.Indicator');
  const props = {
    'aria-hidden': true,
    ...rest,
    'data-stepper-indicator': '',
    ...statusAttributes(state.status),
    className: root.styles.indicator({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  };
  const content = resolveState(children, state);

  if (asChild === true) return <Slot {...props}>{content}</Slot>;
  return <span {...props}>{content === undefined ? defaultGlyph(state) : content}</span>;
}

StepperIndicator.displayName = 'Stepper.Indicator';
