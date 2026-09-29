import { createContext, use, type KeyboardEvent } from 'react';

import { invariant } from '../../../utils';

import type { AccordionHeadingLevel } from '.';
import type { AccordionItemState } from './item';
import type { accordionStyle } from './style';

type RootContext = {
  open: readonly string[];
  disabled: boolean;
  canCollapse: boolean;
  headingLevel: AccordionHeadingLevel;
  styles: ReturnType<typeof accordionStyle>;
  toggle: (value: string) => void;
  reveal: (value: string) => void;
  register: (value: string) => () => void;
  onTriggerKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
};

type ItemContext = {
  state: AccordionItemState;
  locked: boolean;
  triggerId: string;
  contentId: string;
};

export const AccordionContext = createContext<RootContext | null>(null);
export const AccordionItemContext = createContext<ItemContext | null>(null);
export const IndicatorPlacementContext = createContext<'end' | 'inline'>('end');

export function useRootContext(part: string) {
  const context = use(AccordionContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Accordion>\`.`);
  return context;
}

export function useItemContext(part: string) {
  const context = use(AccordionItemContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Accordion.Item>\`.`);
  return context;
}
