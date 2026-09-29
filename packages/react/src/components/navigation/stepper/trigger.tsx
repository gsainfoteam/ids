'use client';

import { isValidElement, type ComponentProps } from 'react';

import { useItemContext, useRootContext } from './context';
import { StepperIndicator } from './indicator';
import { flag, statusAttributes } from './step-state';
import {
  interactiveDataProps,
  useInteractive,
  type InteractiveState,
} from '../../../hooks/use-interactive';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { useTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { StepperItemState } from './item';
import type { StepperStatus } from './step-state';
import type { Translate } from '../../../internal/translate';

export type StepperTriggerState = InteractiveState & StepperItemState;

export type StepperTriggerProps = Omit<
  ComponentProps<'button'>,
  'children' | 'className' | 'style' | 'type' | 'disabled' | 'id'
> &
  StateRenderProps<StepperTriggerState>;

function statusText(status: StepperStatus, t: Translate) {
  if (status === 'completed') return t('stepper.completed');
  if (status === 'error') return t('stepper.error');
  return undefined;
}

export function StepperTrigger({
  className,
  style,
  children,
  onClick,
  onKeyDown,
  onKeyUp,
  onFocus,
  onBlur,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  ...rest
}: StepperTriggerProps) {
  const root = useRootContext('Stepper.Trigger');
  const item = useItemContext('Stepper.Trigger');
  const t = useTranslate();
  const step = String(item.state.index);
  const { state: interaction, handlers } = useInteractive<HTMLButtonElement>({
    disabled: !item.reachable,
    onKeyDown: (event) => {
      onKeyDown?.(event);
      root.onTriggerKeyDown(event);
    },
    onKeyUp,
    onFocus: (event) => {
      onFocus?.(event);
      root.onTriggerFocus(step);
    },
    onBlur,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  });
  const state: StepperTriggerState = { ...interaction, ...item.state };
  const content = resolveState(children, state);
  const hasIndicator = flattenFragments(content).some(
    (child) => isValidElement(child) && elementTypeOf(child) === StepperIndicator,
  );
  const status = statusText(item.state.status, t);
  const shared = {
    id: item.ids.trigger,
    'data-stepper-trigger': root.id,
    'data-value': step,
    ...statusAttributes(item.state.status),
    'data-disabled': flag(item.state.disabled),
    className: root.styles.trigger({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  };
  const body = (
    <>
      {!hasIndicator && <StepperIndicator />}
      {content}
      {status !== undefined && (
        <span id={item.ids.status} className={root.styles.status()}>
          {status}
        </span>
      )}
    </>
  );

  if (!root.interactive)
    return (
      <div {...(rest as ComponentProps<'div'>)} {...shared}>
        {body}
      </div>
    );

  const labelledBy = item.hasTitle
    ? [item.ids.title, status === undefined ? undefined : item.ids.status].filter(Boolean).join(' ')
    : undefined;
  const tabIndex = root.tabStop === undefined ? undefined : root.tabStop === step ? 0 : -1;

  return (
    <button
      type="button"
      aria-labelledby={labelledBy}
      aria-describedby={item.hasDescription ? item.ids.description : undefined}
      {...rest}
      {...handlers}
      {...shared}
      tabIndex={tabIndex}
      disabled={!item.reachable}
      aria-current={item.state.current ? 'step' : undefined}
      {...interactiveDataProps(interaction)}
      data-disabled={flag(item.state.disabled)}
      data-unreachable={flag(!item.reachable && !item.state.disabled)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        root.select(item.state.index);
      }}
    >
      {body}
    </button>
  );
}

StepperTrigger.displayName = 'Stepper.Trigger';
