import { type ComponentProps } from 'react';

import { AccordionItemContext, useRootContext } from './context';
import { flag, openState } from './open-state';
import { useAccordionItem } from './use-accordion';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';

export type AccordionItemState = { value: string; open: boolean; disabled: boolean };

export type AccordionItemProps = Omit<ComponentProps<'div'>, 'children' | 'className' | 'style'> &
  StateRenderProps<AccordionItemState> & {
    value: string;
    disabled?: boolean;
  };

export function AccordionItem({
  value,
  disabled,
  className,
  style,
  children,
  ...rest
}: AccordionItemProps) {
  const root = useRootContext('Accordion.Item');
  const open = root.open.includes(value);
  const isDisabled = root.disabled || disabled === true;
  const { triggerId, contentId, locked } = useAccordionItem({
    value,
    open,
    disabled: isDisabled,
    canCollapse: root.canCollapse,
    register: root.register,
  });
  const state: AccordionItemState = { value, open, disabled: isDisabled };

  return (
    <AccordionItemContext value={{ state, locked, triggerId, contentId }}>
      <div
        {...rest}
        data-accordion-item=""
        {...openState(open)}
        data-disabled={flag(isDisabled)}
        className={root.styles.item({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        {resolveState(children, state)}
      </div>
    </AccordionItemContext>
  );
}

AccordionItem.displayName = 'Accordion.Item';
