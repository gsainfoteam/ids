import { type ComponentProps } from 'react';

import { SpacerRoot } from './root';
import { spacerStyle } from './style';

export function Spacer(props: Spacer.Props) {
  return <SpacerRoot {...props} />;
}

export namespace Spacer {
  export type Props = Omit<
    ComponentProps<'span'>,
    'children' | 'role' | 'aria-hidden' | 'tabIndex'
  >;

  export const Style = spacerStyle;
}
