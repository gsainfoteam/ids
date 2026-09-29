'use client';

import { useCallback, type ComponentProps } from 'react';

import {
  AccordionContent,
  type AccordionContentProps,
  type AccordionContentState,
} from './content';
import { AccordionContext } from './context';
import {
  AccordionIndicator,
  type AccordionIndicatorProps,
  type AccordionIndicatorState,
} from './indicator';
import { AccordionItem, type AccordionItemProps, type AccordionItemState } from './item';
import { flag } from './open-state';
import { accordionStyle } from './style';
import {
  AccordionTrigger,
  type AccordionTriggerProps,
  type AccordionTriggerState,
} from './trigger';
import { ROOT_ATTRIBUTE, useAccordion } from './use-accordion';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { mergeRefs } from '../../../utils';

import type { AccordionValue } from './accordion-value';
import type { IdsSize } from '../../../tokens/types';

export type AccordionVariant = 'outline' | 'soft' | 'ghost';
export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export function Accordion<T extends string = string>(props: Accordion.Props<T>) {
  const {
    type,
    value,
    defaultValue,
    onValueChange,
    collapsible,
    disabled = false,
    variant = 'outline',
    size = 'standard',
    headingLevel = 3,
    className,
    style,
    children,
    ref,
    ...rest
  } = props;

  const { rootRef, state, toggle, reveal, register, onTriggerKeyDown } = useAccordion<T>({
    type,
    value,
    defaultValue,
    onValueChange: onValueChange as ((value: AccordionValue<T>) => void) | undefined,
    collapsible,
    disabled,
  });
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(rootRef, ref)(node),
    [rootRef, ref],
  );

  const styles = accordionStyle({ variant, size });
  const rootState: Accordion.State<T> = { value: state.value, disabled };

  return (
    <AccordionContext
      value={{
        open: state.open,
        disabled,
        canCollapse: state.canCollapse,
        headingLevel,
        styles,
        toggle: toggle as (value: string) => void,
        reveal: reveal as (value: string) => void,
        register,
        onTriggerKeyDown,
      }}
    >
      <div
        {...rest}
        ref={mergedRef}
        {...{ [ROOT_ATTRIBUTE]: '' }}
        data-variant={variant}
        data-size={size}
        data-disabled={flag(disabled)}
        className={styles.root({ className: resolveState(className, rootState) })}
        style={resolveState(style, rootState)}
      >
        {resolveState(children, rootState)}
      </div>
    </AccordionContext>
  );
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
