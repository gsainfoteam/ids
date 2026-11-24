'use client';

import { useCallback, type ComponentProps, type Ref } from 'react';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { mergeRefs } from '../../../../utils';
import { useInternalItemContext, useInternalRootContext } from '../context';
import { useInternalAccordionPanel } from '../hooks/use-accordion';
import { flag, openState } from '../lib/open-state';

import type { AccordionItemState } from './item';

export type AccordionContentState = AccordionItemState;

export type AccordionContentProps = Omit<
  ComponentProps<'section'>,
  'children' | 'className' | 'style' | 'id' | 'role' | 'hidden' | 'inert'
> &
  StateRenderProps<AccordionContentState> & {
    ref?: Ref<HTMLElement>;
  };

export function AccordionContent({
  className,
  style,
  children,
  ref,
  ...rest
}: AccordionContentProps) {
  const root = useInternalRootContext('Accordion.Content');
  const item = useInternalItemContext('Accordion.Content');
  const { state } = item;
  const { panelRef, hidden, closing, instant } = useInternalAccordionPanel({
    open: state.open,
    disabled: state.disabled,
    triggerId: item.triggerId,
    onReveal: () => root.reveal(state.value),
  });
  const mergedRef = useCallback(
    (node: HTMLElement | null) => mergeRefs(panelRef, ref)(node),
    [panelRef, ref],
  );

  return (
    <section
      {...rest}
      ref={mergedRef}
      id={item.contentId}
      aria-labelledby={item.triggerId}
      hidden={hidden}
      inert={closing}
      data-accordion-content=""
      {...openState(state.open)}
      data-disabled={flag(state.disabled)}
      data-instant={flag(instant)}
      className={root.styles.content()}
    >
      <div className={root.styles.clip()}>
        <div
          className={root.styles.body({ className: resolveState(className, state) })}
          style={resolveState(style, state)}
        >
          {resolveState(children, state)}
        </div>
      </div>
    </section>
  );
}

AccordionContent.displayName = 'Accordion.Content';
