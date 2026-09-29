'use client';

import { useCallback } from 'react';

import { AccordionContext } from './context';
import { flag } from './open-state';
import { accordionStyle } from './style';
import { ROOT_ATTRIBUTE, useAccordion } from './use-accordion';
import { resolveState } from '../../../internal/state-props';
import { mergeRefs } from '../../../utils';

import type { Accordion } from '.';
import type { AccordionValue } from './accordion-value';

export type AccordionVariant = 'outline' | 'soft' | 'ghost';
export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

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
