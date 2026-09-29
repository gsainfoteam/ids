import { type ComponentProps } from 'react';

import {
  AccordionContent,
  type AccordionContentProps,
  type AccordionContentState,
} from './content';
import {
  AccordionIndicator,
  type AccordionIndicatorProps,
  type AccordionIndicatorState,
} from './indicator';
import { AccordionItem, type AccordionItemProps, type AccordionItemState } from './item';
import { AccordionRoot, type AccordionVariant, type AccordionHeadingLevel } from './root';
import { accordionStyle } from './style';
import {
  AccordionTrigger,
  type AccordionTriggerProps,
  type AccordionTriggerState,
} from './trigger';
import { type StateRenderProps } from '../../../internal/state-props';

import type { AccordionValue } from './accordion-value';
import type { IdsSize } from '../../../tokens/types';

export function Accordion<T extends string = string>(props: Accordion.Props<T>) {
  return <AccordionRoot {...props} />;
}

export namespace Accordion {
  export type Variant = AccordionVariant;
  export type HeadingLevel = AccordionHeadingLevel;

  export type State<T extends string = string> = {
    value: AccordionValue<T>;
    disabled: boolean;
  };

  type RootProps<T extends string> = Omit<
    ComponentProps<'div'>,
    'children' | 'className' | 'style' | 'defaultValue'
  > &
    StateRenderProps<State<T>> & {
      variant?: AccordionVariant;
      size?: IdsSize;
      disabled?: boolean;
      headingLevel?: AccordionHeadingLevel;
    };

  export type SingleProps<T extends string = string> = RootProps<T> & {
    type: 'single';
    value?: T | null;
    defaultValue?: T | null;
    onValueChange?: (value: T | null) => void;
    collapsible?: boolean;
  };

  export type MultipleProps<T extends string = string> = RootProps<T> & {
    type: 'multiple';
    value?: T[];
    defaultValue?: T[];
    onValueChange?: (value: T[]) => void;
    collapsible?: never;
  };

  export type Props<T extends string = string> = SingleProps<T> | MultipleProps<T>;

  export const Item = AccordionItem;
  export namespace Item {
    export type State = AccordionItemState;
    export type Props = AccordionItemProps;
  }

  export const Trigger = AccordionTrigger;
  export namespace Trigger {
    export type State = AccordionTriggerState;
    export type Props = AccordionTriggerProps;
  }

  export const Indicator = AccordionIndicator;
  export namespace Indicator {
    export type State = AccordionIndicatorState;
    export type Props = AccordionIndicatorProps;
  }

  export const Content = AccordionContent;
  export namespace Content {
    export type State = AccordionContentState;
    export type Props = AccordionContentProps;
  }

  export const Style = accordionStyle;
}

export type { AccordionVariant, AccordionHeadingLevel } from './root';
