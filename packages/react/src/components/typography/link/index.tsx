import { type ComponentProps } from 'react';

import { LinkRoot } from './root';
import { linkStyle } from './style';

export function Link(props: Link.Props) {
  return <LinkRoot {...props} />;
}

export namespace Link {
  export type ColorScheme = 'accent' | 'neutral';
  export type Underline = 'always' | 'hover';

  export type Props = ComponentProps<'a'> & {
    colorScheme?: ColorScheme;
    underline?: Underline;
    asChild?: boolean;
  };

  export const Style = linkStyle;
}
