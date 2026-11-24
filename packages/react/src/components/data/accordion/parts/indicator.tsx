'use client';

import { use, type ComponentProps } from 'react';

import { ChevronDownIcon } from '@heroicons/react/16/solid';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { Slot } from '../../../utility/slot';
import {
  IndicatorPlacementContext,
  useInternalItemContext,
  useInternalRootContext,
} from '../context';
import { openState } from '../lib/open-state';

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
  const root = useInternalRootContext('Accordion.Indicator');
  const { state } = useInternalItemContext('Accordion.Indicator');
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
