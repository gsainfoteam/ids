import {
  cloneElement,
  Fragment,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import { invariant, mergeProps } from '../../utils';

export function Slot({ children, ...slotProps }: Slot.Props) {
  invariant(isValidElement(children), '`<Slot>` requires exactly one React element as its child.');
  invariant(
    children.type !== Fragment,
    '`<Slot>` cannot target a Fragment - cloneElement would set the merged props on the Fragment, not on a host element. Render the element directly.',
  );

  return cloneElement(children, mergeProps(children.props as Record<string, unknown>, slotProps));
}

export namespace Slot {
  export type Props = HTMLAttributes<HTMLElement> & {
    ref?: Ref<HTMLElement>;
    children?: ReactNode;
  };
}
