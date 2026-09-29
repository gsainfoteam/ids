'use client';

import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { Slot } from '../../utility/slot';

import type { SliderState } from '.';
import type { StateProp } from './state-prop';

export type SliderPartProps<S = SliderState> = Omit<
  ComponentProps<'span'>,
  'className' | 'style' | 'children'
> & {
  asChild?: boolean;
  className?: StateProp<string | undefined, S>;
  style?: StateProp<CSSProperties | undefined, S>;
  children?: ReactNode | ((state: S) => ReactNode);
};

export function Part({
  asChild,
  props,
  children,
}: {
  asChild: boolean | undefined;
  props: Record<string, unknown>;
  children: ReactNode;
}) {
  return asChild ? <Slot {...props}>{children}</Slot> : <span {...props}>{children}</span>;
}
