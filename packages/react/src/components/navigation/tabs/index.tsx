import { TabsContent, type TabsContentProps, type TabsContentState } from './content';
import { TabsList, type TabsListProps } from './list';
import { TabsRoot, type TabsProps, type TabsRenderProps, type TabsState } from './root';
import { tabsStyle } from './style';
import { TabsTrigger, type TabsTriggerProps, type TabsTriggerState } from './trigger';

import type { TabsActivationMode, TabsAppearance, TabsOrientation } from './context';

export function Tabs<T extends string = string>(props: Tabs.Props<T>) {
  return <TabsRoot {...props} />;
}

export namespace Tabs {
  export type Props<T extends string = string> = TabsProps<T>;
  export type State<T extends string = string> = TabsState<T>;
  export type RenderProps<T extends string = string> = TabsRenderProps<T>;
  export type Orientation = TabsOrientation;
  export type Appearance = TabsAppearance;
  export type ActivationMode = TabsActivationMode;

  export const List = TabsList;
  export namespace List {
    export type Props = TabsListProps;
  }

  export const Trigger = TabsTrigger;
  export namespace Trigger {
    export type Props<T extends string = string> = TabsTriggerProps<T>;
    export type State = TabsTriggerState;
  }

  export const Content = TabsContent;
  export namespace Content {
    export type Props<T extends string = string> = TabsContentProps<T>;
    export type State = TabsContentState;
  }

  export const Style = tabsStyle;
}

export type { TabsActivationMode, TabsAppearance, TabsOrientation } from './context';
export type { TabsProps, TabsRenderProps, TabsState } from './root';
