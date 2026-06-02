import type { ReactNode } from 'react';

import { cn } from '../../utils';

import type { MainAxis, CrossAxis } from '../../layout/types';

const mainAxisClass: Record<MainAxis, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const crossAxisClass: Record<CrossAxis, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

export function HStack({
  children,
  gap,
  mainAxis = 'start',
  crossAxis = 'stretch',
  className,
}: HStack.Props) {
  return (
    <div
      className={cn('flex flex-row', mainAxisClass[mainAxis], crossAxisClass[crossAxis], className)}
      style={gap !== undefined ? { gap: `${gap * 0.25}rem` } : undefined}
    >
      {children}
    </div>
  );
}

export namespace HStack {
  export type Props = {
    children: ReactNode;
    gap?: number;
    mainAxis?: MainAxis;
    crossAxis?: CrossAxis;
    className?: string;
  };
}
