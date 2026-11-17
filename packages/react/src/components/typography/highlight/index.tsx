import { type ComponentProps, type ReactNode } from 'react';

import { HighlightMark, type HighlightMarkProps } from './mark';
import { HighlightRoot } from './root';
import { highlightStyle } from './style';

export function Highlight(props: Highlight.Props) {
  return <HighlightRoot {...props} />;
}

export namespace Highlight {
  export type Variant = 'soft' | 'solid';

  export type Props = Omit<ComponentProps<'span'>, 'children'> & {
    query: string | readonly string[];
    variant?: Variant;
    children?: ReactNode;
  };

  export const Mark = HighlightMark;
  export namespace Mark {
    export type Props = HighlightMarkProps;
  }

  export const Style = highlightStyle;
}
