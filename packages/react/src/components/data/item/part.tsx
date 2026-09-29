import { type ComponentProps } from 'react';

import { Slot } from '../../utility/slot';

export type ItemPartProps = ComponentProps<'div'> & { asChild?: boolean };

export function Part({ asChild, kind, ...props }: ItemPartProps & { kind: string }) {
  const Root = asChild === true ? Slot : 'div';
  return <Root {...props} {...{ [`data-item-${kind}`]: '' }} />;
}
