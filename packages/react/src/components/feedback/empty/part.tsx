'use client';

import { type ComponentProps } from 'react';

import { Slot } from '../../utility/slot';

export type EmptyPartProps = ComponentProps<'div'> & { asChild?: boolean };

export function Part({ asChild, kind, ...props }: EmptyPartProps & { kind: string }) {
  const Root = asChild === true ? Slot : 'div';
  return <Root {...props} {...{ [`data-empty-${kind}`]: '' }} />;
}
