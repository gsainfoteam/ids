'use client';

import { type ComponentProps, type ComponentType, type ReactNode } from 'react';

import { TabsContent, type TabsContentProps } from './content';
import {
  TabsContext,
  type TabsActivationMode,
  type TabsAppearance,
  type TabsOrientation,
} from './context';
import { TabsList, type TabsListProps } from './list';
import { tabsStyle } from './style';
import { TabsTrigger, type TabsTriggerProps } from './trigger';
import { useTabs } from './use-tabs';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';

import type { IdsSize, IdsVariant } from '../../../tokens/types';

export type TabsState<T extends string = string> = {
  value: T | undefined;
  orientation: TabsOrientation;
  appearance: TabsAppearance;
  size: IdsSize;
};

export type TabsRenderProps<T extends string = string> = {
  List: ComponentType<TabsListProps>;
  Trigger: ComponentType<TabsTriggerProps<T>>;
  Content: ComponentType<TabsContentProps<T>>;
};

type TabsLook =
  | { appearance?: 'underline' | 'enclosed'; variant?: never }
  | { appearance: 'pill'; variant?: IdsVariant };

export type TabsProps<T extends string = string> = Omit<
  ComponentProps<'div'>,
  'children' | 'className' | 'style' | 'defaultValue' | 'onChange'
> &
  Omit<StateRenderProps<TabsState<T>>, 'children'> &
  TabsLook & {
    value?: T;
    defaultValue?: NoInfer<T>;
    onValueChange?: (value: T) => void;
    orientation?: TabsOrientation;
    activationMode?: TabsActivationMode;
    loop?: boolean;
    size?: IdsSize;
    children?: ReactNode | ((parts: TabsRenderProps<T>) => ReactNode);
  };

const parts = { List: TabsList, Trigger: TabsTrigger, Content: TabsContent };

export function TabsRoot<T extends string = string>(props: TabsProps<T>) {
  const {
    value,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    activationMode = 'automatic',
    loop = true,
    appearance = 'underline',
    variant = 'soft',
    size = 'standard',
    className,
    style,
    children,
    ...rest
  } = props;

  const tabs = useTabs({
    value,
    defaultValue,
    onValueChange: onValueChange as ((value: string) => void) | undefined,
    orientation,
    activationMode,
    loop,
  });

  const styles = tabsStyle({ orientation, appearance, variant, size });
  const state: TabsState<T> = { value: tabs.value as T | undefined, orientation, appearance, size };

  return (
    <TabsContext value={{ ...tabs, styles }}>
      <div
        {...rest}
        data-orientation={orientation}
        data-appearance={appearance}
        data-variant={appearance === 'pill' ? variant : undefined}
        data-size={size}
        data-activation-mode={activationMode}
        className={styles.root({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        {typeof children === 'function'
          ? children(parts as unknown as TabsRenderProps<T>)
          : children}
      </div>
    </TabsContext>
  );
}
