'use client';

import { isValidElement, use, type ComponentProps, type ReactNode } from 'react';

import { StepperIndexContext, StepperItemContext, stepIds, useRootContext } from './context';
import { StepperDescription } from './description';
import { StepperSeparator } from './separator';
import { flag, isReachable, statusAttributes, stepStatus, type StepperStatus } from './step-state';
import { StepperTitle } from './title';
import { StepperTrigger } from './trigger';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { containsElementOfType, elementTypeOf, flattenFragments, invariant } from '../../../utils';

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

const isPart = (part: unknown) => (node: ReactNode) =>
  isValidElement(node) && elementTypeOf(node) === part;

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

  const status = stepStatus(index, root.value, { completed, error });
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
  const separators = nodes.filter(isPart(StepperSeparator));
  const steps = nodes.filter((node) => !isPart(StepperSeparator)(node));
  const hasTrigger = steps.some(isPart(StepperTrigger));

  return (
    <StepperItemContext
      value={{
        state,
        reachable,
        hasTitle: containsElementOfType(content, TITLE),
        hasDescription: containsElementOfType(content, DESCRIPTION),
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
        {separators.length > 0 ? separators : !state.last && <StepperSeparator />}
      </li>
    </StepperItemContext>
  );
}

StepperItem.displayName = 'Stepper.Item';
