'use client';

import { type ComponentProps } from 'react';

import { Slot } from '../../utility/slot';

export type CardPartProps = ComponentProps<'div'> & { asChild?: boolean };

export function Part({ asChild, kind, ...props }: CardPartProps & { kind: string }) {
  const Root = asChild === true ? Slot : 'div';
  return <Root {...props} {...{ [`data-card-${kind}`]: '' }} />;
}
