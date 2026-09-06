import type { ComponentProps } from 'react';

import { invariant, tv } from '../../utils';

/** Reserve a width/height ratio independently of the content's intrinsic size. */
export function AspectRatio({ ratio = 1, className, style, children, ...rest }: AspectRatio.Props) {
  invariant(
    Number.isFinite(ratio) && ratio > 0,
    'AspectRatio: ratio must be a finite positive number.',
  );

  return (
    <div
      {...rest}
      className={AspectRatio.Style({ className })}
      style={{ aspectRatio: ratio, ...style }}
    >
      <div className="absolute inset-0 min-h-0 min-w-0">{children}</div>
    </div>
  );
}

export namespace AspectRatio {
  export const Style = tv({ base: 'relative w-full' });

  export type Props = ComponentProps<'div'> & {
    /** Width divided by height; defaults to a square (1). */
    ratio?: number;
  };
}
