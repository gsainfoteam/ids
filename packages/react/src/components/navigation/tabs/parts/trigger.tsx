'use client';

import { type ComponentProps } from 'react';

import { interactiveDataProps, type InteractiveState } from '../../../../hooks/use-interactive';
import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { contentIdOf, triggerIdOf } from '../context';
import { useInternalTabsTrigger } from '../hooks/use-tabs-trigger';

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
  const { tabs, selected, interaction, handlers, tabIndex, controlsMountedPanel } =
    useInternalTabsTrigger(value, {
      disabled,
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
  const state: TabsTriggerState = { ...interaction, value, selected };

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
