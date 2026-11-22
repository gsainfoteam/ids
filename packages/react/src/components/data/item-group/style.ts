import { tv } from '../../../utils';

import type { ItemGroupVariant } from '.';

export const itemGroupStyle = tv({
  slots: {
    root: 'flex min-w-0 flex-col',
    item: 'flex',
  },
  variants: {
    variant: {
      bordered: { root: 'divide-y divide-neutral [&>li>[data-item]]:rounded-none' },
      separated: { root: 'gap-2' },
      ghost: {},
    } satisfies Record<ItemGroupVariant, object>,
  },
  defaultVariants: { variant: 'bordered' },
});
