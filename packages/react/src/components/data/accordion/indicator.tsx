import { use, type ComponentProps } from 'react';

import { ChevronDownIcon } from '@heroicons/react/16/solid';

import { IndicatorPlacementContext, useItemContext, useRootContext } from './context';
import { openState } from './open-state';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { Slot } from '../../utility/slot';

import type { AccordionItemState } from './item';

export type AccordionIndicatorState = AccordionItemState;

export type AccordionIndicatorProps = Omit<
  ComponentProps<'span'>,
  'children' | 'className' | 'style'
> &
  StateRenderProps<AccordionIndicatorState> & {
    asChild?: boolean;
  };

export function AccordionIndicator({
  asChild,
  className,
  style,
  children,
  ...rest
}: AccordionIndicatorProps) {
  const root = useRootContext('Accordion.Indicator');
  const { state } = useItemContext('Accordion.Indicator');
  const placement = use(IndicatorPlacementContext);
  const props = {
    'aria-hidden': true,
    ...rest,
    'data-accordion-indicator': '',
    ...openState(state.open),
    className: root.styles.indicator({ placement, className: resolveState(className, state) }),
    style: resolveState(style, state),
  };
  const content = resolveState(children, state);

  if (asChild === true) return <Slot {...props}>{content}</Slot>;
  return <span {...props}>{content ?? <ChevronDownIcon />}</span>;
}

AccordionIndicator.displayName = 'Accordion.Indicator';
