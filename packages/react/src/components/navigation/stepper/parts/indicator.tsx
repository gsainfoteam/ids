'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { Slot } from '../../../utility/slot';
import { useInternalItemContext, useInternalRootContext } from '../context';
import { statusAttributes } from '../lib/step-state';

import type { StepItemState, StepperItemState } from './item';

export type StepperIndicatorState = StepperItemState;

export type StepIndicatorProps<S = StepItemState> = Omit<
  ComponentProps<'span'>,
  'children' | 'className' | 'style'
> &
  StateRenderProps<S> & {
    asChild?: boolean;
  };

export type StepperIndicatorProps = StepIndicatorProps<StepperIndicatorState>;

const EMPTY_SO_THE_STYLE_DRAWS_A_DOT = null;

function defaultGlyph(state: StepItemState) {
  if (state.status === 'completed') return <CheckIcon />;
  if (state.status === 'error') return <XMarkIcon />;
  if (state.status === 'neutral') return EMPTY_SO_THE_STYLE_DRAWS_A_DOT;
  return state.index + 1;
}

export function StepIndicator({
  asChild,
  className,
  style,
  children,
  ...rest
}: StepIndicatorProps) {
  const root = useInternalRootContext('Indicator');
  const { state } = useInternalItemContext('Indicator');
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

StepIndicator.displayName = 'Stepper.Indicator';

export const StepperIndicator = StepIndicator as (props: StepperIndicatorProps) => ReactNode;
