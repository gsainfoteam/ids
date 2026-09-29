import { type HTMLAttributes, type ReactNode, type Ref } from 'react';

import { SlotRoot } from './root';

export function Slot(props: Slot.Props) {
  return <SlotRoot {...props} />;
}

export namespace Slot {
  export type Props = HTMLAttributes<HTMLElement> & {
    ref?: Ref<HTMLElement>;
    children?: ReactNode;
  };
}
