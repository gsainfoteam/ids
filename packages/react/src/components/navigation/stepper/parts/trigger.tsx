'use client';

import { type ComponentProps } from 'react';

import { StepperBody } from './body';
import { StepperIndicator } from './indicator';
import { interactiveDataProps, type InteractiveState } from '../../../../hooks/use-interactive';
import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { useInternalTranslate } from '../../../../internal/translate';
import { flattenFragments } from '../../../../utils';
import { useInternalStepperTrigger } from '../hooks/use-stepper-trigger';
import { useInternalStepperTriggerBodyWarning } from '../hooks/use-stepper-trigger-body-warning';
import { isType } from '../lib/is-type';
import { statusText } from '../lib/status-text';
import { flag, statusAttributes } from '../lib/step-state';

import type { StepperItemState } from './item';

export type StepperTriggerState = InteractiveState & StepperItemState;

export type StepperTriggerProps = Omit<
  ComponentProps<'button'>,
  'children' | 'className' | 'style' | 'type' | 'disabled' | 'id'
> &
  StateRenderProps<StepperTriggerState>;

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
  const t = useInternalTranslate();
  const { root, item, step, interaction, handlers } = useInternalStepperTrigger({
    onKeyDown,
    onKeyUp,
    onFocus,
    onBlur,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  });
  const state: StepperTriggerState = { ...interaction, ...item.state };
  const content = resolveState(children, state);
  const nodes = flattenFragments(content);
  const hasIndicator = nodes.some(isType(StepperIndicator));
  const holdsBody = nodes.some(isType(StepperBody));
  const status = statusText(item.state.status, t);

  useInternalStepperTriggerBodyWarning(holdsBody);

  const shared = {
    id: item.ids.trigger,
    'data-stepper-trigger': root.id,
    'data-value': step,
    ...statusAttributes(item.state.status),
    'data-disabled': flag(item.state.disabled),
    className: root.styles.trigger({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  };
  const inner = (
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
        {inner}
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
      {inner}
    </button>
  );
}

StepperTrigger.displayName = 'Stepper.Trigger';
