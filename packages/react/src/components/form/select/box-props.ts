import { type ComponentProps, type ReactNode } from 'react';

export type BoxProps = Omit<ComponentProps<'div'>, 'children'> & {
  asChild?: boolean;
  children?: ReactNode;
};
