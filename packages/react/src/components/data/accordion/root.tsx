'use client';

import { useCallback } from 'react';

import { AccordionContext } from './context';
import { ROOT_ATTRIBUTE, useInternalAccordion } from './hooks/use-accordion';
import { flag } from './lib/open-state';
import { accordionStyle } from './style';
import { resolveState } from '../../../internal/lib/state-props';
import { mergeRefs } from '../../../utils';

import type { Accordion } from '.';
import type { AccordionValue } from './lib/accordion-value';

export type AccordionVariant = 'outline' | 'soft' | 'ghost';

export function AccordionRoot<T extends string = string>(props: Accordion.Props<T>) {
  const {
    type,
    value,
    defaultValue,
    onValueChange,
    collapsible,
    disabled = false,
    variant = 'outline',
    size = 'standard',
    className,
    style,
    children,
    ref,
    ...rest
  } = props;

  const { rootRef, state, toggle, reveal, register, onTriggerKeyDown } = useInternalAccordion<T>({
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
