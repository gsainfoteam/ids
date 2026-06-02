import type { ReactNode } from 'react';

import { createStackVariants } from '../../layout/types';

import type { VariantProps } from 'tailwind-variants';

const vstack = createStackVariants({ direction: 'vertical' });

type VStackVariantProps = VariantProps<typeof vstack>;

export function VStack({
  children,
  gap,
  mainAxis = 'start',
  crossAxis = 'stretch',
  fit = 'fill',
  className,
}: VStack.Props) {
  return (
    <div
      className={vstack({ fit, mainAxis, crossAxis, class: className })}
      style={gap !== undefined ? { gap: `${gap}px` } : undefined}
    >
      {children}
    </div>
  );
}

export namespace VStack {
  export type Props = {
    children: ReactNode;
    gap?: number;
    className?: string;
  } & VStackVariantProps;
}
