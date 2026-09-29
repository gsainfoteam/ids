'use client';

import { useEffect, type ComponentProps } from 'react';

import { contentIdOf, triggerIdOf, useTabsContext } from './context';
import {
  interactiveDataProps,
  useInteractive,
  type InteractiveState,
} from '../../../hooks/use-interactive';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';

export type TabsTriggerState = InteractiveState & { value: string; selected: boolean };

export type TabsTriggerProps<T extends string = string> = Omit<
  ComponentProps<'button'>,
  'children' | 'className' | 'style' | 'type' | 'id' | 'role' | 'value'
> &
  StateRenderProps<TabsTriggerState> & {
    value: T;
  };

export function TabsTrigger<T extends string = string>({
  value,
  disabled = false,
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
}: TabsTriggerProps<T>) {
  const tabs = useTabsContext('Tabs.Trigger');
  const { registerTrigger } = tabs;
  useEffect(() => registerTrigger(value), [registerTrigger, value]);

  const selected = tabs.value === value;
  const { state: interaction, handlers } = useInteractive<HTMLButtonElement>({
    disabled,
    onKeyDown: (event) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented) tabs.onTriggerKeyDown(event);
    },
    onKeyUp,
    onFocus: (event) => {
      onFocus?.(event);
      tabs.onTriggerFocus(value);
    },
    onBlur,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  });
  const state: TabsTriggerState = { ...interaction, value, selected };
  const tabIndex = tabs.tabStop === undefined ? undefined : tabs.tabStop === value ? 0 : -1;
  const controlsMountedPanel = selected || tabs.keptMounted.has(value);

  return (
    <button
      type="button"
      {...rest}
      {...handlers}
      id={triggerIdOf(tabs.id, value)}
      role="tab"
      aria-selected={selected}
      aria-controls={controlsMountedPanel ? contentIdOf(tabs.id, value) : undefined}
      disabled={disabled}
      tabIndex={tabIndex}
      data-tabs-trigger={tabs.id}
      data-value={value}
      data-orientation={tabs.orientation}
      data-selected={selected ? '' : undefined}
      {...interactiveDataProps(interaction)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) tabs.select(value);
      }}
      className={tabs.styles.trigger({ className: resolveState(className, state) })}
      style={resolveState(style, state)}
    >
      {resolveState(children, state)}
    </button>
  );
}

TabsTrigger.displayName = 'Tabs.Trigger';
