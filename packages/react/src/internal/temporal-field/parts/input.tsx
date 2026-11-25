'use client';

import { type ComponentProps } from 'react';

import { invariant, mergeProps, part } from '../../../utils';
import { useInternalTemporalContext } from '../context';

export type InputProps = Omit<ComponentProps<'input'>, 'value' | 'defaultValue' | 'type'> & {
  asChild?: boolean;
};

export function TemporalInput({ asChild, ...props }: InputProps) {
  const c = useInternalTemporalContext('Input');
  invariant(c.input, 'Input must be a direct part of its field.');
  return part('input', asChild, undefined, mergeProps(props, c.input));
}
