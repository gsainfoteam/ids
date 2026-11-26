'use client';

import { use, type ComponentProps, type ReactNode } from 'react';

import { StepperBody } from './body';
import {
  StepperIndexContext,
  StepperItemContext,
  stepIds,
  useInternalRootContext,
} from '../context';
import { StepperDescription } from './description';
import { StepperSeparator } from './separator';
import { StepperTitle } from './title';
import { StepperTrigger } from './trigger';
import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { flattenFragments, invariant } from '../../../../utils';
import { containsPart, isType } from '../lib/is-type';
import {
  eventStatus,
  flag,
  isReachable,
  statusAttributes,
  stepStatus,
  type StepperItemStatus,
  type StepperStatus,
  type StepStatus,
  type TimelineStatus,
} from '../lib/step-state';

export type StepItemState = {
  index: number;
  status: StepStatus;
  current: boolean;
  disabled: boolean;
  last: boolean;
};

export type StepperItemState = Omit<StepItemState, 'status'> & { status: StepperStatus };

type StepItemProps = Omit<ComponentProps<'li'>, 'children' | 'className' | 'style'> &
  StateRenderProps<StepItemState> & {
    status?: StepStatus;
    disabled?: boolean;
  };

export type StepperItemProps = Omit<ComponentProps<'li'>, 'children' | 'className' | 'style'> &
  StateRenderProps<StepperItemState> & {
    status?: StepperItemStatus;
    disabled?: boolean;
  };

function statusIn(
  progress: boolean,
  index: number,
  current: number,
  given: StepStatus | undefined,
): StepStatus {
  if (progress) return stepStatus(index, current, given as StepperItemStatus | undefined);
  return eventStatus(given as TimelineStatus | undefined);
}

export function StepItem({
  status: given,
  disabled,
  className,
  style,
  children,
  ...rest
}: StepItemProps) {
  const root = useInternalRootContext('Item');
  const index = use(StepperIndexContext);
  invariant(
    index !== null,
    '`<Stepper.Item>` and `<Timeline.Item>` must be direct children of `<Stepper>` or `<Timeline>`.',
  );

  const status = statusIn(root.progress, index, root.value, given);
  const isDisabled = root.disabled || disabled === true;
  const reachable =
    root.interactive &&
    !isDisabled &&
    isReachable({ index, current: root.value, status, linear: root.linear });
  const state: StepItemState = {
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
        hasTitle: containsPart(steps, StepperTitle),
        hasDescription: containsPart(steps, StepperDescription),
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

StepItem.displayName = 'Stepper.Item';

export const StepperItem = StepItem as (props: StepperItemProps) => ReactNode;
