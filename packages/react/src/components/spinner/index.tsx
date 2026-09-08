import type { ComponentProps } from 'react';

import { tv } from '../../utils';

import type { IdsSize } from '../../tokens/types';

/** An indeterminate loading indicator that inherits the surrounding text color. */
export function Spinner({
  size = 'standard',
  label = 'Loading',
  decorative = false,
  className,
  ...rest
}: Spinner.Props) {
  return (
    <span
      {...rest}
      className={Spinner.Style({ size, className })}
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative ? true : undefined}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        className="size-full animate-spin motion-reduce:animate-none"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.2" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {!decorative && <span className="sr-only">{label}</span>}
    </span>
  );
}

export namespace Spinner {
  export const Style = tv({
    base: 'inline-flex shrink-0 items-center justify-center align-middle',
    variants: {
      size: {
        standard: 'size-5',
        tiny: 'size-4',
      } satisfies Record<IdsSize, string>,
    },
    defaultVariants: {
      size: 'standard',
    },
  });

  export type Props = Omit<ComponentProps<'span'>, 'children' | 'role' | 'aria-hidden'> & {
    /** Matches the 20px / 16px icons used in IDS controls. */
    size?: IdsSize;
    /** Screen reader text for standalone loading feedback. */
    label?: string;
    /** Hide from assistive technology when nearby text already describes loading. */
    decorative?: boolean;
  };
}
