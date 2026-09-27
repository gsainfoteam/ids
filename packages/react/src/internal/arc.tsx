import type { ComponentProps } from 'react';

import { cn } from '../utils';

export const ARC_RADIUS = 9;
export const ARC_CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;

// Sizing and motion are left to the caller: a Spinner must not carry a size class of its own, or
// the icon sizing of the control around it would skip it.
export function Arc({ ratio, trackClassName, indicatorClassName, ...svgProps }: Arc.Props) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" {...svgProps}>
      <circle
        cx="12"
        cy="12"
        r={ARC_RADIUS}
        stroke="currentColor"
        strokeWidth="3"
        className={trackClassName}
      />
      <circle
        cx="12"
        cy="12"
        r={ARC_RADIUS}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={ARC_CIRCUMFERENCE}
        strokeDashoffset={ARC_CIRCUMFERENCE * (1 - ratio)}
        className={cn('origin-center -rotate-90', indicatorClassName)}
      />
    </svg>
  );
}

export namespace Arc {
  export type Props = Omit<ComponentProps<'svg'>, 'children'> & {
    ratio: number;
    trackClassName?: string;
    indicatorClassName?: string;
  };
}
