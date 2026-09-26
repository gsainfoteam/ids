import type { ComponentProps } from 'react';

import { tv } from '../../utils';
import { Arc } from '../arc';

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
      <Arc ratio={0.25} spin trackClassName="opacity-20" />
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
