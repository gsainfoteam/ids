import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { AspectRatioRoot } from './root';
import { aspectRatioStyle } from './style';

export function AspectRatio(props: AspectRatio.Props) {
  return <AspectRatioRoot {...props} />;
}

export namespace AspectRatio {
  export type State = { ratio: number };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    ratio?: number;
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
    children?: ReactNode;
  };

  export const Style = aspectRatioStyle;
}
