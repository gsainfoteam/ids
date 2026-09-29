import { type ComponentProps, type CSSProperties } from 'react';

import { SpacerRoot } from './root';
import { spacerStyle } from './style';

export function Spacer(props: Spacer.Props) {
  return <SpacerRoot {...props} />;
}

export namespace Spacer {
  export type State = { flex: number };

  export type Props = Omit<
    ComponentProps<'span'>,
    'children' | 'role' | 'aria-hidden' | 'tabIndex' | 'className' | 'style'
  > & {
    flex?: number;
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
  };

  export const Style = spacerStyle;
}
