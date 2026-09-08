import type { ComponentProps } from 'react';

import { tv } from '../../utils';

import type { IdsSize } from '../../tokens/types';

/** Display a key or shortcut without registering keyboard handlers. */
export function Kbd({ size = 'standard', className, ...rest }: Kbd.Props) {
  return <kbd {...rest} className={Kbd.Style({ size, className })} />;
}

export namespace Kbd {
  export const Style = tv({
    base: 'inline-flex shrink-0 items-center justify-center rounded border border-b-2 border-(--ids-color-outline) bg-(--ids-color-muted) align-middle font-mono text-(--ids-color-on-surface)',
    variants: {
      size: {
        standard: 'min-h-6 min-w-6 px-1.5 text-caption-c1-medium',
        tiny: 'min-h-5 min-w-5 px-1 text-caption-c2-medium',
      } satisfies Record<IdsSize, string>,
    },
    defaultVariants: { size: 'standard' },
  });

  export type Props = ComponentProps<'kbd'> & {
    size?: IdsSize;
  };
}
