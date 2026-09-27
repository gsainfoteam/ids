import { cn } from '../utils';

export const ARC_RADIUS = 9;
export const ARC_CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;

export function Arc({
  ratio,
  spin = false,
  trackClassName,
  indicatorClassName,
  className,
}: Arc.Props) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      className={cn('size-full', spin && 'animate-spin motion-reduce:animate-none', className)}
    >
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
  export type Props = {
    ratio: number;
    spin?: boolean;
    trackClassName?: string;
    indicatorClassName?: string;
    className?: string;
  };
}
