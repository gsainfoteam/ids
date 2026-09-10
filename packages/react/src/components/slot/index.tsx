import { cloneElement, isValidElement, type HTMLAttributes, type ReactNode, type Ref } from 'react';

import { invariant, mergeProps } from '../../utils';

export function Slot({ children, ...slotProps }: Slot.Props) {
  invariant(isValidElement(children), '`<Slot>` requires exactly one React element as its child.');

  // 자식이 base, Slot이 next. 핸들러는 자식 -> Slot 순서로 돌고, 자식이
  // preventDefault 하면 Slot 쪽은 건너뛴다. 나머지 prop은 Slot이 이긴다.
  return cloneElement(children, mergeProps(children.props as Record<string, unknown>, slotProps));
}

export namespace Slot {
  export type Props = HTMLAttributes<HTMLElement> & {
    ref?: Ref<HTMLElement>;
    children?: ReactNode;
  };
}
