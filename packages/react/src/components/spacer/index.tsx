import type { ComponentProps } from 'react';

import { invariant, tv } from '../../utils';

/** Distribute remaining space along the parent flex container's main axis. */
export function Spacer({ flex = 1, className, style, ...rest }: Spacer.Props) {
  invariant(Number.isFinite(flex) && flex > 0, 'Spacer: flex must be a finite positive number.');

  return (
    <div
      {...rest}
      aria-hidden="true"
      className={Spacer.Style({ className })}
      style={{ flexGrow: flex, ...style }}
    />
  );
}

export namespace Spacer {
  export const Style = tv({ base: 'min-h-0 min-w-0 shrink basis-0' });

  export type Props = Omit<
    ComponentProps<'div'>,
    'children' | 'role' | 'aria-hidden' | 'tabIndex'
  > & {
    /** Positive share of the remaining space; defaults to 1. */
    flex?: number;
  };
}
