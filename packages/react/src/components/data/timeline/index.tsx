import { type ComponentProps } from 'react';

import {
  TimelineBody,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
  type TimelineBodyProps,
  type TimelineDescriptionProps,
  type TimelineIndicatorProps,
  type TimelineItemProps,
  type TimelineItemState,
  type TimelineSeparatorProps,
  type TimelineTitleProps,
} from './parts/parts';
import { TimelineRoot } from './root';
import { timelineStyle } from './style';
import { type StateRenderProps } from '../../../internal/lib/state-props';

import type { AccessibleName } from '../../../internal/lib/accessible-name';
import type { IdsSize } from '../../../tokens/types';
import type { TimelineStatus } from '../../navigation/stepper/lib/step-state';
import type { StepperOrientation } from '../../navigation/stepper/root';

export function Timeline(props: Timeline.Props) {
  return <TimelineRoot {...props} />;
}

export namespace Timeline {
  export type Orientation = StepperOrientation;
  export type Status = TimelineStatus;

  export type State = {
    orientation: StepperOrientation;
  };

  export type Props = Omit<
    ComponentProps<'div'>,
    'children' | 'className' | 'style' | 'defaultValue' | 'onChange'
  > &
    AccessibleName &
    StateRenderProps<State> & {
      orientation?: StepperOrientation;
      size?: IdsSize;
    };

  export type ItemProps = TimelineItemProps;
  export type IndicatorProps = TimelineIndicatorProps;
  export type TitleProps = TimelineTitleProps;
  export type DescriptionProps = TimelineDescriptionProps;
  export type BodyProps = TimelineBodyProps;
  export type SeparatorProps = TimelineSeparatorProps;

  export const Item = TimelineItem;
  export namespace Item {
    export type State = TimelineItemState;
    export type Props = TimelineItemProps;
  }

  export const Indicator = TimelineIndicator;
  export namespace Indicator {
    export type State = TimelineItemState;
    export type Props = TimelineIndicatorProps;
  }

  export const Title = TimelineTitle;
  export namespace Title {
    export type State = TimelineItemState;
    export type Props = TimelineTitleProps;
  }

  export const Description = TimelineDescription;
  export namespace Description {
    export type State = TimelineItemState;
    export type Props = TimelineDescriptionProps;
  }

  export const Body = TimelineBody;
  export namespace Body {
    export type State = TimelineItemState;
    export type Props = TimelineBodyProps;
  }

  export const Separator = TimelineSeparator;
  export namespace Separator {
    export type State = TimelineItemState;
    export type Props = TimelineSeparatorProps;
  }

  export const Style = timelineStyle;
}

export type { TimelineStatus } from '../../navigation/stepper/lib/step-state';
