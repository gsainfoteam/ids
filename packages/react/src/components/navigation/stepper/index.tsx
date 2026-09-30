import { type ComponentProps } from 'react';

import { StepperContent, type StepperContentProps, type StepperContentState } from './content';
import {
  StepperDescription,
  type StepperDescriptionProps,
  type StepperDescriptionState,
} from './description';
import {
  StepperIndicator,
  type StepperIndicatorProps,
  type StepperIndicatorState,
} from './indicator';
import { StepperItem, type StepperItemProps, type StepperItemState } from './item';
import { StepperRoot, type StepperOrientation } from './root';
import {
  StepperSeparator,
  type StepperSeparatorProps,
  type StepperSeparatorState,
} from './separator';
import { stepperStyle } from './style';
import { StepperTitle, type StepperTitleProps, type StepperTitleState } from './title';
import { StepperTrigger, type StepperTriggerProps, type StepperTriggerState } from './trigger';
import { type StateRenderProps } from '../../../internal/state-props';

import type { StepperStatus } from './step-state';
import type { IdsSize } from '../../../tokens/types';

export function Stepper(props: Stepper.Props) {
  return <StepperRoot {...props} />;
}

export namespace Stepper {
  export type Orientation = StepperOrientation;
  export type Status = StepperStatus;

  export type State = {
    value: number;
    orientation: StepperOrientation;
    disabled: boolean;
    progress: boolean;
  };

  export type Props = Omit<
    ComponentProps<'div'>,
    'children' | 'className' | 'style' | 'defaultValue' | 'onChange'
  > &
    StateRenderProps<State> & {
      value?: number;
      defaultValue?: number;
      onValueChange?: (value: number) => void;
      orientation?: StepperOrientation;
      linear?: boolean;
      progress?: boolean;
      size?: IdsSize;
      disabled?: boolean;
    };

  export type ItemProps = StepperItemProps;
  export type TriggerProps = StepperTriggerProps;
  export type IndicatorProps = StepperIndicatorProps;
  export type TitleProps = StepperTitleProps;
  export type DescriptionProps = StepperDescriptionProps;
  export type SeparatorProps = StepperSeparatorProps;
  export type ContentProps = StepperContentProps;

  export const Item = StepperItem;
  export namespace Item {
    export type State = StepperItemState;
    export type Props = StepperItemProps;
  }

  export const Trigger = StepperTrigger;
  export namespace Trigger {
    export type State = StepperTriggerState;
    export type Props = StepperTriggerProps;
  }

  export const Indicator = StepperIndicator;
  export namespace Indicator {
    export type State = StepperIndicatorState;
    export type Props = StepperIndicatorProps;
  }

  export const Title = StepperTitle;
  export namespace Title {
    export type State = StepperTitleState;
    export type Props = StepperTitleProps;
  }

  export const Description = StepperDescription;
  export namespace Description {
    export type State = StepperDescriptionState;
    export type Props = StepperDescriptionProps;
  }

  export const Separator = StepperSeparator;
  export namespace Separator {
    export type State = StepperSeparatorState;
    export type Props = StepperSeparatorProps;
  }

  export const Content = StepperContent;
  export namespace Content {
    export type State = StepperContentState;
    export type Props = StepperContentProps;
  }

  export const Style = stepperStyle;
}

export type { StepperOrientation } from './root';
export type { StepperStatus } from './step-state';
