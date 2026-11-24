import {
  type SchedulerColorScheme,
  type SchedulerEventChange,
  type SchedulerEventData,
  type SchedulerSlot,
  type SchedulerView,
} from './lib/layout';
import { SchedulerEvent, type SchedulerEventPartProps } from './parts/event';
import {
  SchedulerEventMenu,
  SchedulerSlotMenu,
  type SchedulerEventMenuPartProps,
  type SchedulerSlotMenuPartProps,
} from './parts/menus';
import { SchedulerRoot, type SchedulerProps } from './root';
import { schedulerStyle } from './style';

export function Scheduler<E extends SchedulerEventData = SchedulerEventData>(
  props: SchedulerProps<E>,
) {
  return <SchedulerRoot {...props} />;
}

export namespace Scheduler {
  export type Props<E extends SchedulerEventData = SchedulerEventData> = SchedulerProps<E>;
  export type View = SchedulerView;
  export type EventData = SchedulerEventData;
  export type EventChange<E extends SchedulerEventData = SchedulerEventData> =
    SchedulerEventChange<E>;
  export type ColorScheme = SchedulerColorScheme;
  export type Slot = SchedulerSlot;

  export const Event = SchedulerEvent;
  export namespace Event {
    export type Props = SchedulerEventPartProps;
  }

  export const EventMenu = SchedulerEventMenu;
  export namespace EventMenu {
    export type Props<E extends SchedulerEventData = SchedulerEventData> =
      SchedulerEventMenuPartProps<E>;
  }

  export const SlotMenu = SchedulerSlotMenu;
  export namespace SlotMenu {
    export type Props = SchedulerSlotMenuPartProps;
  }

  export const Style = schedulerStyle;
}

export type { SchedulerProps } from './root';
export type {
  SchedulerColorScheme,
  SchedulerEventChange,
  SchedulerEventData,
  SchedulerSlot,
  SchedulerView,
} from './lib/layout';
