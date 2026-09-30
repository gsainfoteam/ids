import { type HTMLAttributes, type ReactNode, type Ref } from 'react';

import { SkeletonRoot } from './root';
import { skeletonStyle } from './style';

export function Skeleton(props: Skeleton.Props) {
  return <SkeletonRoot {...props} />;
}

export namespace Skeleton {
  export type Shape = 'rect' | 'circle' | 'text';
  export type Animation = 'pulse' | 'wave' | 'none';

  export type Props = Omit<
    HTMLAttributes<HTMLElement>,
    'children' | 'aria-busy' | 'aria-hidden' | 'inert'
  > & {
    ref?: Ref<HTMLElement>;
    shape?: Shape;
    lines?: number;
    animation?: Animation;
    loading?: boolean;
    asChild?: boolean;
    children?: ReactNode;
  };

  export const Style = skeletonStyle;
}
