import type { ReactNode } from 'react';

import { createStackVariants } from '../../layout/types';

import type { VariantProps } from 'tailwind-variants';


const hstack = createStackVariants({ direction: 'horizontal' });

type HStackVariantProps = VariantProps<typeof hstack>;

export function HStack({
  children,
  gap,
  mainAxis = 'start',
  crossAxis = 'stretch',
  fit = 'fill',
  className,
}: HStack.Props) {
  return (
    <div
      className={hstack({ fit, mainAxis, crossAxis, class: className })}
      style={gap !== undefined ? { gap: `${gap}px` } : undefined}
    >
      {children}
    </div>
  );
}

export namespace HStack {
  export type Props = {
    children: ReactNode;
    gap?: number;
    className?: string;
  } & HStackVariantProps;
}
