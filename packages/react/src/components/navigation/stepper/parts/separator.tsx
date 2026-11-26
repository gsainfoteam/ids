'use client';

import { type ReactNode } from 'react';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { Divider } from '../../../layout/divider';
import { useInternalItemContext, useInternalRootContext } from '../context';
import { statusAttributes } from '../lib/step-state';

import type { StepItemState, StepperItemState } from './item';

export type StepperSeparatorState = StepperItemState;

export type StepSeparatorProps<S = StepItemState> = Omit<
  Divider.Props,
  'children' | 'className' | 'style' | 'orientation' | 'align' | 'aria-hidden' | 'asChild'
> &
  Omit<StateRenderProps<S>, 'children'>;

export type StepperSeparatorProps = StepSeparatorProps<StepperSeparatorState>;

export function StepSeparator({ className, style, ...rest }: StepSeparatorProps) {
  const root = useInternalRootContext('Separator');
  const { state } = useInternalItemContext('Separator');

  return (
    <Divider
      {...rest}
      aria-hidden
      orientation={root.orientation}
      data-stepper-separator=""
      {...statusAttributes(state.status)}
      className={root.styles.separator({ className: resolveState(className, state) })}
      style={resolveState(style, state)}
    />
  );
}

StepSeparator.displayName = 'Stepper.Separator';

export const StepperSeparator = StepSeparator as (props: StepperSeparatorProps) => ReactNode;
