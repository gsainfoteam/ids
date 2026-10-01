'use client';

import { isValidElement, type ComponentProps } from 'react';

import { IndicatorPlacementContext, useItemContext, useRootContext } from './context';
import { AccordionIndicator } from './indicator';
import { openState } from './open-state';
import { TRIGGER_ATTRIBUTE } from './use-accordion';
import {
  interactiveDataProps,
  useInteractive,
  type InteractiveState,
} from '../../../hooks/use-interactive';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { AccordionItemState } from './item';

export type AccordionTriggerState = InteractiveState & AccordionItemState;

export type AccordionTriggerProps = Omit<
  ComponentProps<'button'>,
  'children' | 'className' | 'style' | 'type' | 'disabled' | 'id'
> &
  StateRenderProps<AccordionTriggerState>;

export function AccordionTrigger({
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
}: AccordionTriggerProps) {
  const root = useRootContext('Accordion.Trigger');
  const item = useItemContext('Accordion.Trigger');
  const { state: interaction, handlers } = useInteractive<HTMLButtonElement>({
    disabled: item.state.disabled,
    onKeyDown: (event) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented) root.onTriggerKeyDown(event);
    },
    onKeyUp,
    onFocus,
    onBlur,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  });
  const state: AccordionTriggerState = { ...interaction, ...item.state };
  const content = resolveState(children, state);
  const nodes = flattenFragments(content);
  const indicatorIndex = nodes.findIndex(
    (child) => isValidElement(child) && elementTypeOf(child) === AccordionIndicator,
  );
  const Heading = `h${root.headingLevel}` as const;

  return (
    <Heading className={root.styles.heading()}>
      <button
        type="button"
        {...rest}
        {...handlers}
        id={item.triggerId}
        aria-expanded={item.state.open}
        aria-controls={item.contentId}
        aria-disabled={item.locked ? true : undefined}
        disabled={item.state.disabled}
        {...{ [TRIGGER_ATTRIBUTE]: '' }}
        {...interactiveDataProps(interaction)}
        {...openState(item.state.open)}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || item.locked) return;
          root.toggle(item.state.value);
        }}
        className={root.styles.trigger({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        <IndicatorPlacementContext
          value={indicatorIndex === -1 || indicatorIndex === nodes.length - 1 ? 'end' : 'inline'}
        >
          {content}
          {indicatorIndex === -1 && <AccordionIndicator />}
        </IndicatorPlacementContext>
      </button>
    </Heading>
  );
}

AccordionTrigger.displayName = 'Accordion.Trigger';
