'use client';

import { type ComponentProps } from 'react';

import { HeaderContext, useRootContext } from './context';
import { Slot } from '../../utility/slot';

export type AccordionHeaderProps = ComponentProps<'h3'> & { asChild?: boolean };

export function AccordionHeader({ asChild, className, ...props }: AccordionHeaderProps) {
  const root = useRootContext('Accordion.Header');
  const Heading = asChild ? Slot : 'h3';

  return (
    <HeaderContext value>
      <Heading {...props} className={root.styles.heading({ className })} />
    </HeaderContext>
  );
}

AccordionHeader.displayName = 'Accordion.Header';
