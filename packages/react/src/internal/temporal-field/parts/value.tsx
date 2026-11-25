'use client';

import { type ComponentProps } from 'react';

import { mergeProps, part } from '../../../utils';
import { useInternalTemporalContext } from '../context';

export type ValueProps = ComponentProps<'span'> & { asChild?: boolean };

export function TemporalValue({ asChild, children, ...props }: ValueProps) {
  const c = useInternalTemporalContext('Value');
  const empty = c.state.empty;
  return part(
    'span',
    asChild,
    children ?? c.text,
    mergeProps({ className: c.styles.value(), 'data-placeholder': empty ? '' : undefined }, props),
  );
}
