import { type ComponentProps } from 'react';

import { MessageGroupRoot } from './root';
import { messageGroupStyle } from './style';

import type { MessageAlign } from '../message';

export function MessageGroup(props: MessageGroup.Props) {
  return <MessageGroupRoot {...props} />;
}

export namespace MessageGroup {
  export type Props = ComponentProps<'div'> & { align?: MessageAlign };

  export const Style = messageGroupStyle;
}
