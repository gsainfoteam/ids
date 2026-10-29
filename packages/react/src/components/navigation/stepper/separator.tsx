'use client';

import { useItemContext, useRootContext } from './context';
import { statusAttributes } from './step-state';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { Divider } from '../../layout/divider';

import type { StepperItemState } from './item';

export type StepperSeparatorState = StepperItemState;

export type StepperSeparatorProps = Omit<
  Divider.Props,
  'children' | 'className' | 'style' | 'orientation' | 'align' | 'decorative' | 'asChild'
> &
  Omit<StateRenderProps<StepperSeparatorState>, 'children'>;

export function StepperSeparator({ className, style, ...rest }: StepperSeparatorProps) {
  const root = useRootContext('Stepper.Separator');
  const { state } = useItemContext('Stepper.Separator');

  return (
    <Divider
      {...rest}
      decorative
      orientation={root.orientation}
      data-stepper-separator=""
      {...statusAttributes(state.status)}
      className={root.styles.separator({ className: resolveState(className, state) })}
      style={resolveState(style, state)}
    />
  );
}

StepperSeparator.displayName = 'Stepper.Separator';
