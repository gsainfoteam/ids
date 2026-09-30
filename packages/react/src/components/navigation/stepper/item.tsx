'use client';

import { use, type ComponentProps } from 'react';

import { StepperBody } from './body';
import { StepperIndexContext, StepperItemContext, stepIds, useRootContext } from './context';
import { StepperDescription } from './description';
import { isType } from './is-type';
import { StepperSeparator } from './separator';
import {
  flag,
  isReachable,
  recordStatus,
  statusAttributes,
  stepStatus,
  type StepperStatus,
} from './step-state';
import { StepperTitle } from './title';
import { StepperTrigger } from './trigger';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { containsElementOfType, flattenFragments, invariant } from '../../../utils';

export type StepperItemState = {
  index: number;
  status: StepperStatus;
  current: boolean;
  disabled: boolean;
  last: boolean;
};

export type StepperItemProps = Omit<ComponentProps<'li'>, 'children' | 'className' | 'style'> &
  StateRenderProps<StepperItemState> & {
    completed?: boolean;
    error?: boolean;
    disabled?: boolean;
  };

const TITLE = new Set<unknown>([StepperTitle]);
const DESCRIPTION = new Set<unknown>([StepperDescription]);

export function StepperItem({
  completed,
  error,
  disabled,
  className,
  style,
  children,
  ...rest
}: StepperItemProps) {
  const root = useRootContext('Stepper.Item');
  const index = use(StepperIndexContext);
  invariant(index !== null, '`<Stepper.Item>` must be a direct child of `<Stepper>`.');

  const status = root.progress
    ? stepStatus(index, root.value, { completed, error })
    : recordStatus({ completed, error });
  const isDisabled = root.disabled || disabled === true;
  const reachable =
    root.interactive &&
    !isDisabled &&
    isReachable({ index, current: root.value, status, linear: root.linear });
  const state: StepperItemState = {
    index,
    status,
    current: index === root.value,
    disabled: isDisabled,
    last: index === root.count - 1,
  };

  const content = resolveState(children, state);
  const nodes = flattenFragments(content);
  const separators = nodes.filter(isType(StepperSeparator));
  const bodies = nodes.filter(isType(StepperBody));
  const steps = nodes.filter((node) => !separators.includes(node) && !bodies.includes(node));
  const hasTrigger = steps.some(isType(StepperTrigger));

  return (
    <StepperItemContext
      value={{
        state,
        reachable,
        hasTitle: containsElementOfType(steps, TITLE),
        hasDescription: containsElementOfType(steps, DESCRIPTION),
        ids: stepIds(root.id, index),
      }}
    >
      <li
        {...rest}
        aria-current={state.current && !root.interactive ? 'step' : undefined}
        data-stepper-item=""
        {...statusAttributes(status)}
        data-disabled={flag(isDisabled)}
        className={root.styles.item({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        {hasTrigger ? steps : <StepperTrigger>{steps}</StepperTrigger>}
        {bodies}
        {separators.length > 0 ? separators : !state.last && <StepperSeparator />}
      </li>
    </StepperItemContext>
  );
}

StepperItem.displayName = 'Stepper.Item';
