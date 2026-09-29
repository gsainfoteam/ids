import { useCallback, type ComponentProps, type Ref } from 'react';

import { useItemContext, useRootContext } from './context';
import { flag, openState } from './open-state';
import { useAccordionPanel } from './use-accordion';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { mergeRefs } from '../../../utils';

import type { AccordionItemState } from './item';

export type AccordionContentState = AccordionItemState;

export type AccordionContentProps = Omit<
  ComponentProps<'div'>,
  'children' | 'className' | 'style' | 'id' | 'role' | 'hidden' | 'inert'
> &
  StateRenderProps<AccordionContentState> & {
    ref?: Ref<HTMLDivElement>;
  };

export function AccordionContent({
  className,
  style,
  children,
  ref,
  ...rest
}: AccordionContentProps) {
  const root = useRootContext('Accordion.Content');
  const item = useItemContext('Accordion.Content');
  const { state } = item;
  const { panelRef, hidden, closing, instant } = useAccordionPanel({
    open: state.open,
    disabled: state.disabled,
    triggerId: item.triggerId,
    onReveal: () => root.reveal(state.value),
  });
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(panelRef, ref)(node),
    [panelRef, ref],
  );

  return (
    <div
      {...rest}
      ref={mergedRef}
      id={item.contentId}
      role="region"
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
    </div>
  );
}

AccordionContent.displayName = 'Accordion.Content';
